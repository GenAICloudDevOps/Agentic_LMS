# Slack Notifications Setup Guide

This guide will help you set up Slack notifications for your LMS platform to receive real-time enrollment alerts.

## Prerequisites

- A Slack workspace (free plan is sufficient)
- Admin access to the Slack workspace

## Step-by-Step Setup

### 1. Create or Access Your Slack Workspace

If you don't have a Slack workspace:
- Go to https://slack.com/create
- Follow the prompts to create a new workspace
- Name it something like "LMS Admin" or use your company name

### 2. Create a Slack Channel (Optional)

Create a dedicated channel for enrollment notifications:
1. Open Slack
2. Click the "+" next to "Channels" in the sidebar
3. Click "Create a channel"
4. Name it: `#enrollments` or `#lms-notifications`
5. Make it private or public based on your preference
6. Click "Create"

### 3. Create a Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter App Name: `LMS Notifications` (or any name you prefer)
5. Select your workspace from the dropdown
6. Click **"Create App"**

### 4. Enable Incoming Webhooks

1. In your app settings, click **"Incoming Webhooks"** in the left sidebar
2. Toggle the switch to **"On"** (Activate Incoming Webhooks)
3. Scroll down and click **"Add New Webhook to Workspace"**
4. Select the channel where you want notifications to appear:
   - Choose `#enrollments` (or your preferred channel)
   - Or select `#general` if you don't have a dedicated channel
5. Click **"Allow"**

### 5. Copy Your Webhook URL

After authorization, you'll see your webhook URL:
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

**Important:** Keep this URL secure! Anyone with this URL can send messages to your Slack channel.

### 6. Add Webhook to Your .env File

1. Open your `.env` file in the project root
2. Add the following line:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```
3. Replace with your actual webhook URL
4. Save the file

### 7. Restart Your Application

If using Docker:
```bash
docker-compose down
docker-compose up -d
```

If running locally:
```bash
# Stop your backend server (Ctrl+C)
# Start it again
cd backend
uvicorn main:app --reload
```

## Testing Your Setup

### Option 1: Test with the Test Script

```bash
docker exec -it lms_backend python test_email.py
```

This will send a test notification to your Slack channel.

### Option 2: Create a Real Enrollment

1. Open your LMS frontend
2. Create a student account
3. Enroll in a course
4. Check your Slack channel for the notification

## What You'll Receive

When a student enrolls, you'll get a Slack message with:
- 🎓 Header: "New Course Enrollment"
- Student name and email
- Course title, category, and difficulty
- Enrollment ID
- Timestamp

## Troubleshooting

### No messages appearing in Slack?

1. **Check the webhook URL** - Make sure it's correctly copied to `.env`
2. **Verify the channel** - Confirm you're looking at the right channel
3. **Check logs** - Look for error messages in your backend logs:
   ```bash
   docker logs lms_backend
   ```
4. **Test the webhook manually** - Use curl:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
   --data '{"text":"Test message"}' \
   YOUR_WEBHOOK_URL
   ```

### Webhook expired or invalid?

If your webhook stops working:
1. Go back to https://api.slack.com/apps
2. Select your app
3. Go to "Incoming Webhooks"
4. Remove the old webhook
5. Add a new webhook to workspace
6. Update your `.env` file with the new URL

## Managing Multiple Channels

You can send different notifications to different channels:

1. Create multiple webhooks for different channels
2. Add them to `.env`:
```
SLACK_WEBHOOK_ENROLLMENTS=https://hooks.slack.com/services/.../...
SLACK_WEBHOOK_ERRORS=https://hooks.slack.com/services/.../...
SLACK_WEBHOOK_REPORTS=https://hooks.slack.com/services/.../...
```

## Security Best Practices

- ✅ Never commit `.env` file to git (it's in `.gitignore`)
- ✅ Don't share your webhook URL publicly
- ✅ Rotate webhooks if compromised
- ✅ Use private channels for sensitive information
- ✅ Limit workspace access to trusted team members

## Additional Resources

- [Slack Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder) - Design custom message layouts
- [Slack API Documentation](https://api.slack.com/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Verify your webhook URL is active in Slack app settings
4. Test with a simple curl command first

---

**Note:** This setup uses Incoming Webhooks, which is the simplest method for sending notifications. For more advanced features (like interactive buttons or user mentions), you'll need to use the full Slack API with OAuth tokens.
