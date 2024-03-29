# Omnizart UI

## About

Omnizart UI is a browser-based UI to simplify use of [*Omnizart*](https://music-and-culture-technology-lab.github.io/omnizart-doc/) - a ML music transcription tool that converts music files into *MIDI* files.

![Page preview](/docs/preview.png)

## Usage Guide

### Installation
- **Prerequisites**:
  - Docker Desktop installed
- Clone this repository into a folder of your choosing
- Set the `working directory` to the folder containing the `docker-compose.yml` file
- Run `docker compose up` in the terminal
- Navigate to [http://localhost:5173/](http://localhost:5173/)

### Converting a music file to MIDI
1) Upload a file within the `Select Input File` section
2) Select the desired transcription mode
   - Music (Transcribes all instruments/vocals)
   - Vocal (Extracts out only the melody)
3) Click Transcribe
   - *Alternatively*, toggle `Auto-Transcribe` to `On` to start the transcription process immediately after uploading a file
4) Wait for transcription to finish (this may take a while)
5) To hear a preview of the transcribed file, start the player in the `Transcription Result` section
6) Click on `Download` to download the resultant *MIDI* file.

### Downloading a previously transcribed file
1) Navigate to the sidebar, click the `›` button to expand it if neccessary
2) Find the transcribed file and click on the download icon
    - Results can be filtered based on filename in the `Settings` box

## Remarks

- *Omnizart UI* not directly affliated with the original creators of *Omnizart*
- The transcription history is stored in **non-persistent storage**, destroying the backend container will erase the transcription history
- Modes `Drums` & `Chords` are currently unsupported due to Python version dependency issues in Omnizart (Python 2.7 required)
- `Vocal Contour` is omitted, since it produces a .wav file instead of a midi transcription.

## Attributions
Citation as requested by the authors of Omnizart:
```
[Omnizart]
@article{Wu2021,
  doi = {10.21105/joss.03391},
  url = {https://doi.org/10.21105/joss.03391},
  year = {2021},
  publisher = {The Open Journal},
  volume = {6},
  number = {68},
  pages = {3391},
  author = {Yu-Te Wu and Yin-Jyun Luo and Tsung-Ping Chen and I-Chieh Wei and Jui-Yang Hsu and Yi-Chin Chuang and Li Su},
  title = {Omnizart: A General Toolbox for Automatic Music Transcription},
  journal = {Journal of Open Source Software}
}
```