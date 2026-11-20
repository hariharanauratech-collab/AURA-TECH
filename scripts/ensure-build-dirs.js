import fs from 'fs';

if (fs.existsSync('dist')) {
  try {
    fs.cpSync('dist', 'built', { recursive: true });
    fs.cpSync('dist', 'build', { recursive: true });
    console.log('✓ Successfully mirrored dist to built and build directories for deployment compatibility.');
  } catch (err) {
    console.error('Error copying build output:', err);
  }
}
