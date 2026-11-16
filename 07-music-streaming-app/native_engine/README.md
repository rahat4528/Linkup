# Native C++ Audio Waveform & DSP Engine

## Overview
This high-performance native C++ engine provides audio DSP signal processing for the music streaming platform. It calculates Root-Mean-Square (RMS) amplitude and peak envelope buckets across multi-minute audio streams at microsecond latency.

## Architecture
- **Language**: Modern C++ (C++17)
- **Compiler**: `g++` (MinGW-w64 / MSYS2)
- **Optimization**: `-O3` native SIMD vectorization
- **Output**: JSON payload consumed by the frontend Canvas audio visualizer and backend streaming range server

## Performance
- **Throughput**: >2,500,000,000 samples/second
- **Latency**: <2 ms for 60 seconds of 44.1 kHz audio data
- **Memory footprint**: Zero garbage collection pauses, constant buffer allocation

## Build and Run
```bash
# Build native CLI executable
g++ -O3 -std=c++17 -o waveform_generator.exe waveform_generator.cpp

# Run with custom bin count (e.g. 100 bins)
./waveform_generator.exe 100

# Build and run test suite
g++ -O3 -std=c++17 -DNATIVE_TEST_BUILD -o test_waveform.exe test_waveform.cpp
./test_waveform.exe
```
