import mongoose from 'mongoose';
import Course from "../models/Course.js";

// Handle uploads and update course with lecture details
export const uploadCourse = async (req, res) => {
  try {
    console.log("Received file data:", req.files);

    const { mentorId, courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID not provided.' });
    }

    const lectures = [];
    const keys = Object.keys(req.files);
    keys.forEach(key => {
      const indexMatch = key.match(/^lecture(\d+)_thumbnail$/);
      if (indexMatch) {
        const index = indexMatch[1];
        const videoKey = `lecture${index}_video`;

        if (req.files[videoKey] && req.files[key]) {
          lectures.push({
            thumbnail: {
              url: req.files[key][0].path,
              public_id: req.files[key][0].filename
            },
            video: {
              url: req.files[videoKey][0].path,
              public_id: req.files[videoKey][0].filename
            }
          });
        }
      }
    });

    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          lectures: { $each: lectures }
        }
      },
      { new: true }
    );

    res.json({
      message: 'Course and lectures updated successfully',
      fileUrls: req.files,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'An error occurred during file upload.' });
  }
};



export const uploadPhoto = (req, res,next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded.' });
    }

    req.fileUrl = req.file.path;

    next();

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'An error occurred during photo upload.' });
  }
};