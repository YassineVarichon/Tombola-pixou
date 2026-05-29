import shutil
import os

source = "/Users/yas/.gemini/antigravity/brain/824b5432-0fd2-4a04-b72a-550ca37d8d74/media__1780048411583.png"
destination = "/Users/yas/Desktop/tombola_pixou/assets/pablo_photo.png"

if os.path.exists(source):
    shutil.copy(source, destination)
    print("SUCCESS")
else:
    print("SOURCE NOT FOUND")
