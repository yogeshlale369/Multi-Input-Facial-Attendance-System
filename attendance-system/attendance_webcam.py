import cv2
import face_recognition
import numpy as np
import os
import pandas as pd
from datetime import datetime

# Function to load known faces from a directory
def load_known_faces(known_faces_dir):
    known_encodings = []
    known_names = []
    known_details = []  # Store Rollno, PRN, FirstName, LastName, Division

    # Load all images from known_faces_dir
    for filename in os.listdir(known_faces_dir):
        if filename.endswith('.jpeg') or filename.endswith('.jpg'):  # Check for jpeg/jpg files
            path = os.path.join(known_faces_dir, filename)
            name_parts = filename.split('_')

            # Extract Rollno, PRN, FirstName, LastName, and Division from the filename
            rollno = name_parts[0]
            prn = name_parts[1]
            first_name = name_parts[2]
            last_name = name_parts[3]
            division = name_parts[4].split('.')[0]  # Remove file extension

            # Load image and encode the face
            img = face_recognition.load_image_file(path)
            encoding = face_recognition.face_encodings(img)[0]

            known_encodings.append(encoding)
            known_names.append(first_name + ' ' + last_name)  # Store full name
            known_details.append((rollno, prn, first_name, last_name, division))  # Store details tuple

    return known_encodings, known_names, known_details

# Function to recognize faces in the captured frame
def recognize_faces(frame, known_encodings, known_names):
    # Find face locations and face encodings in the captured image
    face_locations = face_recognition.face_locations(frame)
    face_encodings = face_recognition.face_encodings(frame, face_locations)

    recognized_names = []

    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)

        # If match found
        if True in matches:
            match_index = matches.index(True)
            name = known_names[match_index]
            recognized_names.append(name)

    return recognized_names

# Function to save attendance to a CSV file
def save_attendance(rollno, prn, first_name, last_name, division, time_str, classroom, csv_file='/Users/yogesh/projects/CNTv1/attendance-dashboard/public/attendance.csv'):
    # If the file exists, load it, otherwise create an empty DataFrame
    if os.path.exists(csv_file):
        df = pd.read_csv(csv_file)
    else:
        # Create a DataFrame with the required columns
        df = pd.DataFrame(columns=['Rollno', 'PRN', 'FirstName', 'LastName', 'Division', 'Time', 'Classroom'])

    # Append new entry using _append()
    new_entry = {'Rollno': rollno, 'PRN': prn, 'FirstName': first_name, 'LastName': last_name, 'Division': division, 'Time': time_str, 'Classroom': classroom}
    df = df._append(new_entry, ignore_index=True)

    # Save back to CSV
    df.to_csv(csv_file, index=False)
    print(f"Attendance marked for {first_name} {last_name} (Rollno: {rollno}, PRN: {prn}, Division: {division}) at {time_str} in classroom {classroom}")

# Main function for continuous monitoring using a computer webcam
def main():
    known_faces_dir = '/Users/yogesh/projects/CNTv1/attendance-system/known_faces/known_faces'
    known_encodings, known_names, known_details = load_known_faces(known_faces_dir)

    # Set to keep track of recognized names
    recognized_students = set()
    classroom = "A101"  # Example classroom; change as needed

    # Initialize webcam
    cap = cv2.VideoCapture(0)  # 0 is typically the default webcam

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame from webcam.")
            break

        # Resize the frame to speed up face recognition processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)

        recognized_names = recognize_faces(small_frame, known_encodings, known_names)

        # Mark attendance for recognized names
        for name in recognized_names:
            if name not in recognized_students:
                # Find the index to get the details
                index = known_names.index(name)
                rollno, prn, first_name, last_name, division = known_details[index]

                # Mark attendance for the student
                time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                save_attendance(rollno, prn, first_name, last_name, division, time_str, classroom)
                recognized_students.add(name)  # Add to the set to prevent re-capturing

        # Display the video feed
        cv2.imshow("Webcam Attendance Monitoring", frame)

        # Break the loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the webcam and close windows
    cap.release()
    cv2.destroyAllWindows()

# Run the attendance monitoring system
if __name__ == "__main__":
    main()
