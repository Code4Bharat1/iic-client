const ICONS = {
  dashboard: 'M4 4h7v9H4zM13 4h7v5h-7zM13 12h7v8h-7zM4 16h7v4H4z',
  calendar: 'M3 4h18v18H3zM3 9h18M8 2v4M16 2v4',
  availability: 'M12 8v4l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  bookings: 'M4 6h16M4 12h16M4 18h10',
  events: 'M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  closure: 'm5 13 4 4L19 7',
  approvals: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  resources: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
  issues: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  reports: 'M3 3v18h18M9 17V9m4 8V5m4 12v-6',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  contacts: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  audit: 'M9 12h6m-6 4h6m-9-8h.01M4 6h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6ZM4 6l2-4h12l2 4',
};

export function getNavSections(role) {
  const main = [
    { href: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { href: '/calendar', label: 'Calendar', icon: ICONS.calendar },
    { href: '/availability', label: 'Availability', icon: ICONS.availability },
    { href: '/bookings', label: 'Bookings', icon: ICONS.bookings },
    { href: '/events', label: 'Events', icon: ICONS.events },
    { href: '/closure', label: 'Closure', icon: ICONS.closure },
  ];

  const admin = [
    { href: '/approvals', label: 'Approvals', icon: ICONS.approvals },
    { href: '/resources', label: 'Resources', icon: ICONS.resources },
    { href: '/issues', label: 'Issues', icon: ICONS.issues },
    { href: '/reports', label: 'Reports', icon: ICONS.reports },
  ];

  const management = [
    { href: '/contacts', label: 'Contacts', icon: ICONS.contacts },
    { href: '/audit-log', label: 'Audit Log', icon: ICONS.audit },
  ];
  if (role === 'master_admin') {
    management.unshift({ href: '/users', label: 'Users', icon: ICONS.users });
    management.push({ href: '/settings', label: 'Settings', icon: ICONS.settings });
  }

  const sections = [{ title: 'Main', items: main }];
  if (role === 'admin' || role === 'master_admin') sections.push({ title: 'Admin', items: admin });
  if (role === 'admin' || role === 'master_admin') sections.push({ title: 'Management', items: management });

  return sections;
}
