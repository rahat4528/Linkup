CXX = g++
CXXFLAGS = -O3 -std=c++17 -Wall

all: waveform_generator.exe test_waveform.exe

waveform_generator.exe: waveform_generator.cpp
	$(CXX) $(CXXFLAGS) -o waveform_generator.exe waveform_generator.cpp

test_waveform.exe: test_waveform.cpp waveform_generator.cpp
	$(CXX) $(CXXFLAGS) -DNATIVE_TEST_BUILD -o test_waveform.exe test_waveform.cpp

test: test_waveform.exe
	./test_waveform.exe

clean:
	rm -f *.exe *.o
