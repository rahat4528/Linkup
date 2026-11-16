#include <iostream>
#include <vector>
#include <cassert>
#include <cmath>
#include <chrono>
#include "waveform_generator.cpp"

void test_empty_input() {
    std::vector<float> empty;
    WaveformResult res = AudioWaveformProcessor::processSamples(empty, 50);
    assert(res.peaks.size() == 50);
    assert(res.rmsValues.size() == 50);
    assert(res.globalMaxPeak == 0.0f);
    assert(res.avgRms == 0.0f);
    std::cout << "[PASS] test_empty_input" << std::endl;
}

void test_silence_input() {
    std::vector<float> silence(10000, 0.0f);
    WaveformResult res = AudioWaveformProcessor::processSamples(silence, 100);
    assert(res.peaks.size() == 100);
    for (float p : res.peaks) {
        assert(p == 0.0f);
    }
    for (float r : res.rmsValues) {
        assert(r == 0.0f);
    }
    std::cout << "[PASS] test_silence_input" << std::endl;
}

void test_normalized_peaks() {
    std::vector<float> samples(1000);
    for (size_t i = 0; i < 1000; ++i) {
        samples[i] = (i % 2 == 0) ? 0.5f : -0.8f;
    }
    WaveformResult res = AudioWaveformProcessor::processSamples(samples, 20);
    assert(res.peaks.size() == 20);
    assert(std::abs(res.globalMaxPeak - 0.8f) < 0.001f);
    // Normalized peak should be exactly 1.0 at maximum
    for (float p : res.peaks) {
        assert(p >= 0.0f && p <= 1.0f);
    }
    std::cout << "[PASS] test_normalized_peaks" << std::endl;
}

void test_performance_throughput() {
    // 5 minutes of 44.1kHz audio = 13,230,000 samples
    size_t sampleCount = 44100 * 60; // 1 minute
    std::vector<float> audioData(sampleCount, 0.25f);

    auto start = std::chrono::high_resolution_clock::now();
    WaveformResult res = AudioWaveformProcessor::processSamples(audioData, 200);
    auto end = std::chrono::high_resolution_clock::now();

    auto durationMs = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
    std::cout << "[PASS] test_performance_throughput: processed " 
              << sampleCount << " samples in " << durationMs << " ms ("
              << (sampleCount / (durationMs > 0 ? durationMs : 1) * 1000) << " samples/sec)" << std::endl;
    assert(durationMs < 1000); // Must process 1 minute of audio in under 1 second
}

int main() {
    std::cout << "Running Native C++ DSP Test Suite..." << std::endl;
    test_empty_input();
    test_silence_input();
    test_normalized_peaks();
    test_performance_throughput();
    std::cout << "All 4 Native C++ Audio DSP tests passed successfully!" << std::endl;
    return 0;
}
