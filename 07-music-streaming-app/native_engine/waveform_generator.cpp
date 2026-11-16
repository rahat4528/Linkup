#include <iostream>
#include <vector>
#define _USE_MATH_DEFINES
#include <cmath>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
#include <string>
#include <fstream>
#include <iomanip>
#include <algorithm>

/**
 * Native C++ Audio Waveform & Peak Envelope Generator
 * Provides microsecond-latency audio signal processing, computing RMS energy
 * and peak normalized envelopes for responsive visual waveform rendering.
 */

struct WaveformResult {
    std::vector<float> peaks;
    std::vector<float> rmsValues;
    float globalMaxPeak;
    float avgRms;
    size_t sampleCount;
};

class AudioWaveformProcessor {
public:
    static WaveformResult processSamples(const std::vector<float>& samples, size_t targetBins = 100) {
        WaveformResult result;
        result.globalMaxPeak = 0.0f;
        result.avgRms = 0.0f;
        result.sampleCount = samples.size();

        if (samples.empty() || targetBins == 0) {
            result.peaks.assign(targetBins, 0.0f);
            result.rmsValues.assign(targetBins, 0.0f);
            return result;
        }

        result.peaks.resize(targetBins, 0.0f);
        result.rmsValues.resize(targetBins, 0.0f);

        size_t samplesPerBin = std::max<size_t>(1, samples.size() / targetBins);
        float totalRmsSum = 0.0f;

        for (size_t bin = 0; bin < targetBins; ++bin) {
            size_t startIdx = bin * samplesPerBin;
            size_t endIdx = (bin == targetBins - 1) ? samples.size() : std::min(samples.size(), startIdx + samplesPerBin);

            if (startIdx >= samples.size()) {
                result.peaks[bin] = 0.0f;
                result.rmsValues[bin] = 0.0f;
                continue;
            }

            float binMax = 0.0f;
            double sumSquares = 0.0;
            size_t count = 0;

            for (size_t i = startIdx; i < endIdx; ++i) {
                float absVal = std::abs(samples[i]);
                if (absVal > binMax) {
                    binMax = absVal;
                }
                sumSquares += (absVal * absVal);
                count++;
            }

            float binRms = (count > 0) ? static_cast<float>(std::sqrt(sumSquares / count)) : 0.0f;
            result.peaks[bin] = binMax;
            result.rmsValues[bin] = binRms;

            if (binMax > result.globalMaxPeak) {
                result.globalMaxPeak = binMax;
            }
            totalRmsSum += binRms;
        }

        result.avgRms = totalRmsSum / static_cast<float>(targetBins);

        // Normalize peaks between 0.0 and 1.0 if max peak > 0
        if (result.globalMaxPeak > 0.00001f) {
            for (size_t i = 0; i < targetBins; ++i) {
                result.peaks[i] = std::clamp(result.peaks[i] / result.globalMaxPeak, 0.0f, 1.0f);
            }
        }

        return result;
    }

    static std::string toJson(const WaveformResult& res) {
        std::ostringstream ss;
        ss << std::fixed << std::setprecision(4);
        ss << "{\n";
        ss << "  \"sampleCount\": " << res.sampleCount << ",\n";
        ss << "  \"globalMaxPeak\": " << res.globalMaxPeak << ",\n";
        ss << "  \"avgRms\": " << res.avgRms << ",\n";
        ss << "  \"peaks\": [";
        for (size_t i = 0; i < res.peaks.size(); ++i) {
            ss << res.peaks[i] << (i + 1 < res.peaks.size() ? ", " : "");
        }
        ss << "],\n";
        ss << "  \"rmsValues\": [";
        for (size_t i = 0; i < res.rmsValues.size(); ++i) {
            ss << res.rmsValues[i] << (i + 1 < res.rmsValues.size() ? ", " : "");
        }
        ss << "]\n";
        ss << "}";
        return ss.str();
    }
};

#ifndef NATIVE_TEST_BUILD
int main(int argc, char* argv[]) {
    // If run as CLI tool, accepts sample count or generates test synthetic audio buffer
    size_t bins = 100;
    if (argc > 1) {
        bins = std::stoul(argv[1]);
    }

    // Generate a synthetic musical audio signal (chords + transients)
    const size_t sampleRate = 44100;
    const double durationSec = 2.0;
    size_t totalSamples = static_cast<size_t>(sampleRate * durationSec);
    std::vector<float> audioBuffer(totalSamples);

    for (size_t i = 0; i < totalSamples; ++i) {
        double t = static_cast<double>(i) / sampleRate;
        // Harmonics: 440Hz + 880Hz with envelope decay
        double env = std::exp(-1.5 * std::fmod(t, 0.5));
        double sig = (std::sin(2.0 * M_PI * 440.0 * t) * 0.6 +
                      std::sin(2.0 * M_PI * 880.0 * t) * 0.4) * env;
        audioBuffer[i] = static_cast<float>(sig);
    }

    WaveformResult res = AudioWaveformProcessor::processSamples(audioBuffer, bins);
    std::cout << AudioWaveformProcessor::toJson(res) << std::endl;
    return 0;
}
#endif
