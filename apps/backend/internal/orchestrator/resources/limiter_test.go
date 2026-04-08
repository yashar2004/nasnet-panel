//go:build linux

package resources

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"backend/internal/events"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

// mockEventBus is a simple mock implementation of EventBus for testing
type mockEventBus struct {
	mu              sync.Mutex
	publishedEvents []events.Event
}

func newMockEventBus() *mockEventBus {
	return &mockEventBus{
		publishedEvents: make([]events.Event, 0),
	}
}

func (m *mockEventBus) Publish(ctx context.Context, event events.Event) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.publishedEvents = append(m.publishedEvents, event)
	return nil
}

func (m *mockEventBus) Subscribe(eventType string, handler events.EventHandler) error {
	return nil
}

func (m *mockEventBus) SubscribeAll(handler events.EventHandler) error {
	return nil
}

func (m *mockEventBus) Close() error {
	return nil
}

func (m *mockEventBus) getPublishedEvents() []events.Event {
	m.mu.Lock()
	defer m.mu.Unlock()
	return append([]events.Event{}, m.publishedEvents...)
}

func (m *mockEventBus) reset() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.publishedEvents = make([]events.Event, 0)
}

// TestNewResourceLimiter tests the constructor
func TestNewResourceLimiter(t *testing.T) {
	t.Run("requires EventBus", func(t *testing.T) {
		config := ResourceLimiterConfig{
			Logger: zap.NewNop().Sugar(),
		}
		_, err := NewResourceLimiter(config)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "EventBus is required")
	})

	t.Run("creates successfully with valid config", func(t *testing.T) {
		bus := newMockEventBus()
		config := ResourceLimiterConfig{
			EventBus: bus,
			Logger:   zap.NewNop().Sugar(),
		}
		rl, err := NewResourceLimiter(config)
		require.NoError(t, err)
		assert.NotNil(t, rl)
		assert.NotNil(t, rl.publisher)
		assert.NotNil(t, rl.monitors)
	})
}

// TestApplyMemoryLimitSuccess tests successful memory limit application
func TestApplyMemoryLimitSuccess(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	if !rl.cgroupsEnabled {
		t.Skip("cgroups v2 not available on this system")
	}

	// Use current process PID for testing
	pid := os.Getpid()
	memoryMB := 64

	// Create base cgroup directory
	err = os.MkdirAll(CgroupBasePath, 0755)
	require.NoError(t, err)

	instanceID := fmt.Sprintf("instance-%d", pid)

	err = rl.ApplyMemoryLimit(context.Background(), pid, memoryMB, instanceID, "test-feature")
	require.NoError(t, err)

	cgroupPath := filepath.Join(CgroupBasePath, instanceID)

	// Check memory.max
	memoryMaxPath := filepath.Join(cgroupPath, "memory.max")
	content, err := os.ReadFile(memoryMaxPath)
	require.NoError(t, err)
	expectedHardLimit := uint64(memoryMB) * 1024 * 1024
	assert.Contains(t, string(content), fmt.Sprintf("%d", expectedHardLimit))

	// Check memory.high
	memoryHighPath := filepath.Join(cgroupPath, "memory.high")
	content, err = os.ReadFile(memoryHighPath)
	require.NoError(t, err)
	expectedSoftLimit := uint64(float64(expectedHardLimit) * SoftLimitPercentage)
	assert.Contains(t, string(content), fmt.Sprintf("%d", expectedSoftLimit))

	// Cleanup
	os.RemoveAll(cgroupPath)
}

// TestGetResourceUsage tests reading resource usage from /proc
func TestGetResourceUsage(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	// Use current process PID
	pid := os.Getpid()

	usage, err := rl.GetResourceUsage(pid)
	require.NoError(t, err)
	assert.NotNil(t, usage)
	assert.Equal(t, pid, usage.PID)
	assert.Greater(t, usage.MemoryMB, uint64(0))
	assert.False(t, usage.Time.IsZero())
}

// TestMonitoringLoopTriggersWarning tests that monitoring emits warnings at 80%
func TestMonitoringLoopTriggersWarning(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	pid := os.Getpid()

	// Get current usage
	usage, err := rl.GetResourceUsage(pid)
	require.NoError(t, err)

	// Set limit slightly above current usage to trigger warning
	// Memory limit of 1MB should trigger warning since current usage is higher
	memoryLimitMB := 1

	// Start monitoring with short interval for testing
	err = rl.StartMonitoring(context.Background(), pid, "test-instance", "test-feature", memoryLimitMB)
	require.NoError(t, err)

	// Wait for at least one monitoring cycle (we'll wait 2 seconds for safety)
	time.Sleep(2 * time.Second)

	// Stop monitoring
	rl.StopMonitoring(pid)

	// Verify warning event was published (should trigger since usage > 80% of limit)
	events := bus.getPublishedEvents()
	if usage.MemoryMB > uint64(float64(memoryLimitMB)*ResourceWarningThreshold) {
		assert.Greater(t, len(events), 0, "should have published at least one warning event")
		// Find resource warning event
		foundWarning := false
		for _, event := range events {
			if event.GetType() == EventTypeResourceWarning {
				foundWarning = true
				break
			}
		}
		assert.True(t, foundWarning, "should have published ResourceWarningEvent")
	}
}

// TestGracefulFallbackWhenCgroupsUnavailable tests graceful fallback
func TestGracefulFallbackWhenCgroupsUnavailable(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	// Simulate cgroups unavailable
	rl.cgroupsEnabled = false

	pid := os.Getpid()
	memoryMB := 64

	// Should not return error when cgroups unavailable
	err = rl.ApplyMemoryLimit(context.Background(), pid, memoryMB, "test-instance", "test-feature")
	assert.NoError(t, err, "should gracefully handle cgroups unavailability")
}

// TestInvalidPIDHandling tests handling of invalid PIDs
func TestInvalidPIDHandling(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	t.Run("GetResourceUsage with non-existent PID", func(t *testing.T) {
		// Use a very high PID that likely doesn't exist
		invalidPID := 999999
		_, err := rl.GetResourceUsage(invalidPID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "failed to open")
	})

	t.Run("StartMonitoring with invalid PID", func(t *testing.T) {
		err := rl.StartMonitoring(context.Background(), 0, "test-instance", "test-feature", 64)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid PID")
	})

	t.Run("StartMonitoring with negative PID", func(t *testing.T) {
		err := rl.StartMonitoring(context.Background(), -1, "test-instance", "test-feature", 64)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid PID")
	})
}

// TestMemoryLimitTooLow tests minimum memory limit enforcement
func TestMemoryLimitTooLow(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	pid := os.Getpid()

	// Test with memory limit below minimum
	err = rl.ApplyMemoryLimit(context.Background(), pid, 8, "test-instance", "test-feature")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "below minimum")

	// Test with 0 MB
	err = rl.ApplyMemoryLimit(context.Background(), pid, 0, "test-instance", "test-feature")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "below minimum")
}

// TestCgroupDirectoryCreation tests cgroup directory creation
func TestCgroupDirectoryCreation(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	if !rl.cgroupsEnabled {
		t.Skip("cgroups v2 not available on this system")
	}

	pid := os.Getpid()
	memoryMB := 32

	// Ensure clean state
	instanceID := fmt.Sprintf("instance-%d", pid)
	cgroupPath := filepath.Join(CgroupBasePath, instanceID)
	os.RemoveAll(cgroupPath)

	// Apply memory limit (should create directory)
	err = rl.ApplyMemoryLimit(context.Background(), pid, memoryMB, instanceID, "test-feature")
	require.NoError(t, err)

	// Verify directory was created
	info, err := os.Stat(cgroupPath)
	require.NoError(t, err)
	assert.True(t, info.IsDir())

	// Verify it's readable
	assert.Equal(t, os.FileMode(0755), info.Mode().Perm())

	// Cleanup
	os.RemoveAll(cgroupPath)
}

// TestStopMonitoring tests stopping monitoring
func TestStopMonitoring(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	pid := os.Getpid()
	memoryMB := 64

	// Start monitoring
	err = rl.StartMonitoring(context.Background(), pid, "test-instance", "test-feature", memoryMB)
	require.NoError(t, err)

	// Verify monitor was registered
	rl.mu.RLock()
	_, exists := rl.monitors[pid]
	rl.mu.RUnlock()
	assert.True(t, exists)

	// Stop monitoring
	rl.StopMonitoring(pid)

	// Verify monitor was removed
	rl.mu.RLock()
	_, exists = rl.monitors[pid]
	rl.mu.RUnlock()
	assert.False(t, exists)
}

// TestClose tests cleanup on close
func TestClose(t *testing.T) {
	bus := newMockEventBus()
	config := ResourceLimiterConfig{
		EventBus: bus,
		Logger:   zap.NewNop().Sugar(),
	}
	rl, err := NewResourceLimiter(config)
	require.NoError(t, err)

	pid := os.Getpid()
	memoryMB := 64

	// Start monitoring for multiple PIDs
	err = rl.StartMonitoring(context.Background(), pid, "test-instance", "test-feature", memoryMB)
	require.NoError(t, err)

	// Verify monitors exist
	rl.mu.RLock()
	monitorCount := len(rl.monitors)
	rl.mu.RUnlock()
	assert.Greater(t, monitorCount, 0)

	// Close
	err = rl.Close()
	require.NoError(t, err)

	// Verify all monitors stopped
	rl.mu.RLock()
	assert.Equal(t, 0, len(rl.monitors))
	rl.mu.RUnlock()
}
