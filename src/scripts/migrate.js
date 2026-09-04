const fs = require('fs');
const path = require('path');

const clientRoot = path.join(__dirname, '..', '..');
const pagesDir = path.join(clientRoot, 'pages');
const appDir = path.join(clientRoot, 'src', 'app');
const authDir = path.join(appDir, '(authenticated)');

function movePage(oldPath, newPath) {
  const fullOldPath = path.join(pagesDir, oldPath);
  const fullNewPath = path.join(clientRoot, newPath);
  if (!fs.existsSync(fullOldPath)) return;
  fs.mkdirSync(path.dirname(fullNewPath), { recursive: true });
  fs.renameSync(fullOldPath, fullNewPath);
  console.log(`Moved ${oldPath} to ${newPath}`);
}

// Public
movePage('index.js', 'src/app/page.jsx');
movePage('login.js', 'src/app/login/page.jsx');

// Authenticated
const authPages = [
  { old: 'dashboard.js', new: 'src/app/(authenticated)/dashboard/page.jsx' },
  { old: 'calendar.js', new: 'src/app/(authenticated)/calendar/page.jsx' },
  { old: 'availability.js', new: 'src/app/(authenticated)/availability/page.jsx' },
  { old: 'contacts.js', new: 'src/app/(authenticated)/contacts/page.jsx' },
  { old: 'users.js', new: 'src/app/(authenticated)/users/page.jsx' },
  { old: 'settings.js', new: 'src/app/(authenticated)/settings/page.jsx' },
  { old: 'audit-log.js', new: 'src/app/(authenticated)/audit-log/page.jsx' },
  { old: 'bookings/index.js', new: 'src/app/(authenticated)/bookings/page.jsx' },
  { old: 'bookings/new.js', new: 'src/app/(authenticated)/bookings/new/page.jsx' },
  { old: 'bookings/[id].js', new: 'src/app/(authenticated)/bookings/[id]/page.jsx' },
  { old: 'bookings/[id]/edit.js', new: 'src/app/(authenticated)/bookings/[id]/edit/page.jsx' },
  { old: 'events/index.js', new: 'src/app/(authenticated)/events/page.jsx' },
  { old: 'events/[id].js', new: 'src/app/(authenticated)/events/[id]/page.jsx' },
  { old: 'approvals/index.js', new: 'src/app/(authenticated)/approvals/page.jsx' },
  { old: 'approvals/[id].js', new: 'src/app/(authenticated)/approvals/[id]/page.jsx' },
  { old: 'closure/index.js', new: 'src/app/(authenticated)/closure/page.jsx' },
  { old: 'closure/[id].js', new: 'src/app/(authenticated)/closure/[id]/page.jsx' },
  { old: 'resources/index.js', new: 'src/app/(authenticated)/resources/page.jsx' },
  { old: 'resources/[id].js', new: 'src/app/(authenticated)/resources/[id]/page.jsx' },
  { old: 'issues/index.js', new: 'src/app/(authenticated)/issues/page.jsx' },
  { old: 'issues/[id].js', new: 'src/app/(authenticated)/issues/[id]/page.jsx' },
  { old: 'reports/index.js', new: 'src/app/(authenticated)/reports/page.jsx' }
];

authPages.forEach(p => movePage(p.old, p.new));
