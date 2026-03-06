import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        options: [
          {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false },
          },
        ],
        explanation: {
          type: String,
          maxlength: 500,
          default: '',
        },
        points: {
          type: Number,
          default: 1,
        },
      },
    ],
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number, // minutes
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ course: 1, moduleId: 1, lessonId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
