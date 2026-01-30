# How to Deploy to Hostinger

This guide explains how to deploy your Azen Voice project to Hostinger.

## Prerequisites
- A Hostinger account with a hosting plan.
- Access to the Hostinger hPanel.

## Steps

### 1. Build the Project
We have already configured the project for deployment. Run the build command to generate the static files:

```bash
npm run build
```

This will create a `dist` folder in your project directory containing:
- `index.html`
- `assets/` (your compiled code and styles)
- `.htaccess` (configuration for routing)

### 2. Prepare for Upload
You can upload the files directly or zip them for faster upload:
1. Go to the `dist` folder.
2. Select all files (`cmd+a`).
3. Right-click and compress/zip them into `archive.zip` (or similar).

### 3. Upload to Hostinger
1. Log in to **Hostinger hPanel**.
2. Go to **Websites** and click **Manage** on your domain.
3. Search for **File Manager** and open it.
4. Navigate to `public_html`.
   - If there is a default `default.php` or `index.php`, delete it.
5. Drag and drop your `dist` files (or your zip file) into `public_html`.
   - If you uploaded a zip, right-click it and select **Extract**. Make sure the files are directly in `public_html`, not in a subdirectory.

### 4. Verify
Visit your domain. Your site should be live!
Try navigating to different pages (e.g., `/solutions/receptionist`) and refreshing the page to ensure the routing works.

## Troubleshooting
- **404 on Refresh**: Ensure the `.htaccess` file was uploaded to `public_html`. It is hidden by default on some systems, so make sure it's included in your upload.
- **White Screen**: Check the **Console** in your browser's Developer Tools (F12) for errors.
