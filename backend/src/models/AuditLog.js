import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user_register',
        'user_login',
        'user_update',
        'user_delete',
        'instructor_apply',
        'instructor_approve',
        'instructor_reject',
        'course_create',
        'course_update',
        'course_delete',
        'course_approve',
        'course_reject',
        'course_publish',
        'enrollment_create',
        'order_create',
        'order_complete',
        'review_create',
        'withdrawal_request',
        'withdrawal_process',
        'coupon_create',
        'admin_action',
      ],
    },
    resource: {
      type: String,
      enum: [
        'user',
        'course',
        'order',
        'enrollment',
        'review',
        'withdrawal',
        'coupon',
        'system',
      ],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
