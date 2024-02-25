from typing import Final
from pydub import AudioSegment

class SoundUtil:
    @staticmethod
    def ConvertFileToWav(
        originalFilename: str, 
        destFilename: str, 
        minDurationMilliseconds: str) -> None:
        
        decoded: AudioSegment = AudioSegment.from_file(originalFilename);
        
        #Pad with silent audio if necessary
        fileLengthMillis: Final[int] = len(decoded)
        if (len(decoded) <= minDurationMilliseconds):
            paddingMillis: Final[int] = fileLengthMillis - minDurationMilliseconds;
            decoded = decoded + AudioSegment.silent(paddingMillis);    

        decoded.export(destFilename, format="wav");

