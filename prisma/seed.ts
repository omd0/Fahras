// =============================================================================
// Fahras — Prisma Database Seed Script
// =============================================================================
// Creates comprehensive seed data for development and testing.
// Run with: npx prisma db seed
// =============================================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

// ---------------------------------------------------------------------------
// Seed Functions
// ---------------------------------------------------------------------------

async function seedRoles() {
  console.log('🔑 Seeding roles...');

  const roles = [
    { name: 'admin', description: 'System administrator with full access', isSystemRole: true },
    { name: 'faculty', description: 'Faculty member who can supervise projects', isSystemRole: true },
    { name: 'student', description: 'Student who can create and manage projects', isSystemRole: true },
    { name: 'reviewer', description: 'Reviewer with read-only access to all projects', isSystemRole: true },
  ] as const;

  const created: Record<string, { id: number }> = {};
  for (const role of roles) {
    created[role.name] = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log(`   ✓ Created ${Object.keys(created).length} roles`);
  return created;
}

async function seedPermissions() {
  console.log('🔒 Seeding permissions...');

  const permissions = [
    // User management
    { code: 'users.create', category: 'Users' as const, description: 'Create users' },
    { code: 'users.read', category: 'Users' as const, description: 'View users' },
    { code: 'users.update', category: 'Users' as const, description: 'Update users' },
    { code: 'users.delete', category: 'Users' as const, description: 'Delete users' },
    // Project management
    { code: 'projects.create', category: 'Projects' as const, description: 'Create projects' },
    { code: 'projects.read', category: 'Projects' as const, description: 'View projects' },
    { code: 'projects.update', category: 'Projects' as const, description: 'Update projects' },
    { code: 'projects.delete', category: 'Projects' as const, description: 'Delete projects' },
    { code: 'projects.approve', category: 'Projects' as const, description: 'Approve projects' },
    // File management
    { code: 'files.upload', category: 'Files' as const, description: 'Upload files' },
    { code: 'files.download', category: 'Files' as const, description: 'Download files' },
    { code: 'files.delete', category: 'Files' as const, description: 'Delete files' },
    // System
    { code: 'system.admin', category: 'System' as const, description: 'System administration' },
  ];

  const created: Record<string, { id: number }> = {};
  for (const perm of permissions) {
    created[perm.code] = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  console.log(`   ✓ Created ${Object.keys(created).length} permissions`);
  return created;
}

async function seedPermissionRoles(
  roles: Record<string, { id: number }>,
  permissions: Record<string, { id: number }>,
) {
  console.log('🔗 Linking permissions to roles...');

  // Admin gets ALL permissions with global scope
  const adminPerms = Object.values(permissions).map((p) => ({
    roleId: roles.admin.id,
    permissionId: p.id,
    scope: 'all' as const,
  }));

  // Faculty permissions
  const facultyCodes = [
    'users.read',
    'projects.create',
    'projects.read',
    'projects.update',
    'projects.approve',
    'files.upload',
    'files.download',
    'files.delete',
  ];
  const facultyPerms = facultyCodes.map((code) => ({
    roleId: roles.faculty.id,
    permissionId: permissions[code].id,
    scope: code === 'projects.approve' ? ('department' as const) : ('all' as const),
  }));

  // Student permissions — scoped to own resources
  const studentCodes = [
    'users.read',
    'projects.create',
    'projects.read',
    'projects.update',
    'projects.delete',
    'files.upload',
    'files.download',
    'files.delete',
  ];
  const studentPerms = studentCodes.map((code) => ({
    roleId: roles.student.id,
    permissionId: permissions[code].id,
    scope: ['projects.create', 'projects.update', 'projects.delete', 'files.upload', 'files.delete'].includes(code)
      ? ('own' as const)
      : ('all' as const),
  }));

  // Reviewer permissions — read-only
  const reviewerCodes = ['users.read', 'projects.read', 'files.download'];
  const reviewerPerms = reviewerCodes.map((code) => ({
    roleId: roles.reviewer.id,
    permissionId: permissions[code].id,
    scope: 'all' as const,
  }));

  const allPerms = [...adminPerms, ...facultyPerms, ...studentPerms, ...reviewerPerms];

  // Use upsert to handle existing records
  let count = 0;
  for (const perm of allPerms) {
    await prisma.permissionRole.upsert({
      where: {
        roleId_permissionId: {
          roleId: perm.roleId,
          permissionId: perm.permissionId,
        },
      },
      update: { scope: perm.scope },
      create: perm,
    });
    count++;
  }

  console.log(`   ✓ Linked ${count} permission-role assignments`);
}

async function seedDepartments() {
  console.log('🏫 Seeding departments...');

  const departments = [
    { name: 'Computer Science' },
    { name: 'Information Technology' },
    { name: 'Software Engineering' },
    { name: 'Cybersecurity' },
    { name: 'Data Science' },
    { name: 'Artificial Intelligence' },
  ];

  const created: Record<string, { id: number }> = {};
  for (const dept of departments) {
    const d = await prisma.department.upsert({
      where: { id: departments.indexOf(dept) + 1 },
      update: {},
      create: dept,
    });
    created[dept.name] = d;
  }

  console.log(`   ✓ Created ${Object.keys(created).length} departments`);
  return created;
}

async function seedPrograms(departments: Record<string, { id: number }>) {
  console.log('📚 Seeding programs...');

  const programs = [
    // Computer Science
    { departmentId: departments['Computer Science'].id, name: 'Bachelor of Computer Science', degreeLevel: 'bachelor' as const },
    { departmentId: departments['Computer Science'].id, name: 'Master of Computer Science', degreeLevel: 'master' as const },
    { departmentId: departments['Computer Science'].id, name: 'PhD in Computer Science', degreeLevel: 'phd' as const },
    // Information Technology
    { departmentId: departments['Information Technology'].id, name: 'Bachelor of Information Technology', degreeLevel: 'bachelor' as const },
    { departmentId: departments['Information Technology'].id, name: 'Master of Information Technology', degreeLevel: 'master' as const },
    // Software Engineering
    { departmentId: departments['Software Engineering'].id, name: 'Bachelor of Software Engineering', degreeLevel: 'bachelor' as const },
    { departmentId: departments['Software Engineering'].id, name: 'Master of Software Engineering', degreeLevel: 'master' as const },
  ];

  const created: Record<string, { id: number }> = {};
  for (const prog of programs) {
    const p = await prisma.program.create({ data: prog });
    created[prog.name] = p;
  }

  console.log(`   ✓ Created ${Object.keys(created).length} programs`);
  return created;
}

async function seedUsers(
  roles: Record<string, { id: number }>,
  departments: Record<string, { id: number }>,
  programs: Record<string, { id: number }>,
) {
  console.log('👤 Seeding users...');

  const hashedPassword = await hashPassword('password');

  // ── Admin ──
  const admin = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@fahras.edu',
      password: hashedPassword,
      status: 'active',
      roleUsers: { create: { roleId: roles.admin.id } },
    },
  });

  // ── Faculty ──
  const facultyData = [
    {
      user: { fullName: 'Dr. Sarah Johnson', email: 'sarah.johnson@fahras.edu' },
      faculty: { departmentId: departments['Computer Science'].id, facultyNo: 'FAC001', isSupervisor: true },
    },
    {
      user: { fullName: 'Prof. Michael Chen', email: 'michael.chen@fahras.edu' },
      faculty: { departmentId: departments['Information Technology'].id, facultyNo: 'FAC002', isSupervisor: true },
    },
    {
      user: { fullName: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@fahras.edu' },
      faculty: { departmentId: departments['Software Engineering'].id, facultyNo: 'FAC003', isSupervisor: false },
    },
  ];

  const facultyUsers: Array<{ id: number }> = [];
  for (const f of facultyData) {
    const user = await prisma.user.create({
      data: {
        ...f.user,
        password: hashedPassword,
        status: 'active',
        roleUsers: { create: { roleId: roles.faculty.id } },
        faculty: { create: f.faculty },
      },
    });
    facultyUsers.push(user);
  }

  // ── Students ──
  const studentData = [
    {
      user: { fullName: 'Ahmed Al-Mansouri', email: 'ahmed.almansouri@student.fahras.edu' },
      student: { programId: programs['Bachelor of Computer Science'].id, studentNo: 'STU001', cohortYear: 2023 },
    },
    {
      user: { fullName: 'Fatima Hassan', email: 'fatima.hassan@student.fahras.edu' },
      student: { programId: programs['Bachelor of Computer Science'].id, studentNo: 'STU002', cohortYear: 2023 },
    },
    {
      user: { fullName: 'Omar Khalil', email: 'omar.khalil@student.fahras.edu' },
      student: { programId: programs['Master of Computer Science'].id, studentNo: 'STU003', cohortYear: 2022 },
    },
    {
      user: { fullName: 'Layla Ibrahim', email: 'layla.ibrahim@student.fahras.edu' },
      student: { programId: programs['Bachelor of Software Engineering'].id, studentNo: 'STU004', cohortYear: 2022 },
    },
  ];

  const studentUsers: Array<{ id: number }> = [];
  for (const s of studentData) {
    const user = await prisma.user.create({
      data: {
        ...s.user,
        password: hashedPassword,
        status: 'active',
        roleUsers: { create: { roleId: roles.student.id } },
        student: { create: s.student },
      },
    });
    studentUsers.push(user);
  }

  // ── Reviewer ──
  const reviewer = await prisma.user.create({
    data: {
      fullName: 'Reviewer User',
      email: 'reviewer@fahras.edu',
      password: hashedPassword,
      status: 'active',
      roleUsers: { create: { roleId: roles.reviewer.id } },
    },
  });

  console.log(`   ✓ Created 9 users (1 admin, 3 faculty, 4 students, 1 reviewer)`);
  return { admin, facultyUsers, studentUsers, reviewer };
}

async function seedMilestoneTemplate(adminId: number) {
  console.log('📋 Seeding milestone template...');

  const template = await prisma.milestoneTemplate.create({
    data: {
      name: 'Default Graduation Project Template',
      description: 'Standard milestone template for graduation projects with 10 phases from proposal to final presentation.',
      isDefault: true,
      createdByUserId: adminId,
      items: {
        create: [
          { title: 'Project Proposal', description: 'Submit initial project proposal with problem statement and objectives.', order: 1, estimatedDays: 14, isRequired: true },
          { title: 'Literature Review', description: 'Research and document related work, existing solutions, and theoretical background.', order: 2, estimatedDays: 21, isRequired: true },
          { title: 'Requirements Analysis', description: 'Define functional and non-functional requirements with use cases.', order: 3, estimatedDays: 14, isRequired: true },
          { title: 'System Design', description: 'Create system architecture, database design, and UI mockups.', order: 4, estimatedDays: 21, isRequired: true },
          { title: 'Implementation Phase 1', description: 'Develop core features and backend functionality.', order: 5, estimatedDays: 28, isRequired: true },
          { title: 'Implementation Phase 2', description: 'Develop frontend, integration, and secondary features.', order: 6, estimatedDays: 28, isRequired: true },
          { title: 'Testing & QA', description: 'Perform unit testing, integration testing, and user acceptance testing.', order: 7, estimatedDays: 14, isRequired: true },
          { title: 'Documentation', description: 'Write technical documentation, user manuals, and project report.', order: 8, estimatedDays: 14, isRequired: true },
          { title: 'Final Review', description: 'Submit final deliverables for advisor review and approval.', order: 9, estimatedDays: 7, isRequired: true },
          { title: 'Final Presentation', description: 'Present the project to the evaluation committee.', order: 10, estimatedDays: 7, isRequired: true },
        ],
      },
    },
  });

  console.log(`   ✓ Created milestone template with 10 items`);
  return template;
}

async function seedProjects(
  studentUsers: Array<{ id: number }>,
  facultyUsers: Array<{ id: number }>,
  programs: Record<string, { id: number }>,
  templateId: number,
) {
  console.log('📁 Seeding projects...');

  const bcsId = programs['Bachelor of Computer Science'].id;
  const mcsId = programs['Master of Computer Science'].id;
  const bseId = programs['Bachelor of Software Engineering'].id;

  const projectsData = [
    {
      slug: generateSlug(),
      programId: bcsId,
      createdByUserId: studentUsers[0].id,
      title: 'Smart Campus Management System',
      abstract: 'A comprehensive system for managing campus resources, student activities, and administrative tasks using modern web technologies. The platform integrates real-time notifications, resource booking, and analytics dashboards.',
      keywords: ['web development', 'campus management', 'student portal'],
      academicYear: '2024-2025',
      semester: 'fall' as const,
      status: 'completed' as const,
      isPublic: true,
      adminApprovalStatus: 'approved' as const,
      doi: '10.1000/fahras.2024.001',
      repoUrl: 'https://github.com/example/smart-campus',
    },
    {
      slug: generateSlug(),
      programId: bcsId,
      createdByUserId: studentUsers[1].id,
      title: 'AI-Powered Learning Assistant',
      abstract: 'An intelligent tutoring system that adapts to individual learning styles and provides personalized educational content using machine learning algorithms and natural language processing.',
      keywords: ['artificial intelligence', 'machine learning', 'education'],
      academicYear: '2024-2025',
      semester: 'spring' as const,
      status: 'completed' as const,
      isPublic: true,
      adminApprovalStatus: 'approved' as const,
      doi: '10.1000/fahras.2024.002',
      repoUrl: 'https://github.com/example/ai-tutor',
    },
    {
      slug: generateSlug(),
      programId: mcsId,
      createdByUserId: studentUsers[2].id,
      title: 'Sustainable Energy Monitoring Platform',
      abstract: 'A real-time monitoring system for tracking energy consumption and optimizing renewable energy usage in educational institutions. Features IoT sensor integration and predictive analytics.',
      keywords: ['sustainability', 'energy monitoring', 'IoT'],
      academicYear: '2023-2024',
      semester: 'summer' as const,
      status: 'completed' as const,
      isPublic: true,
      adminApprovalStatus: 'approved' as const,
      doi: '10.1000/fahras.2023.003',
      repoUrl: 'https://github.com/example/energy-monitor',
    },
    {
      slug: generateSlug(),
      programId: bseId,
      createdByUserId: studentUsers[3].id,
      title: 'Blockchain-Based Academic Credential Verification',
      abstract: 'A secure and tamper-proof system for verifying academic credentials using blockchain technology. Implements smart contracts for automated verification workflows.',
      keywords: ['blockchain', 'security', 'credentials', 'verification'],
      academicYear: '2024-2025',
      semester: 'fall' as const,
      status: 'submitted' as const,
      isPublic: true,
      adminApprovalStatus: 'pending' as const,
    },
    {
      slug: generateSlug(),
      programId: bcsId,
      createdByUserId: studentUsers[0].id,
      title: 'Virtual Reality Laboratory Environment',
      abstract: 'An immersive VR platform for conducting virtual science experiments and laboratory simulations. Supports multiplayer collaboration and real-time physics simulation.',
      keywords: ['virtual reality', 'education', 'simulation', 'laboratory'],
      academicYear: '2023-2024',
      semester: 'spring' as const,
      status: 'draft' as const,
      isPublic: false,
      adminApprovalStatus: 'hidden' as const,
    },
  ];

  const projects: Array<{ id: number }> = [];
  for (const data of projectsData) {
    const project = await prisma.project.create({ data });
    projects.push(project);
  }

  // Add project members (students as leads)
  for (let i = 0; i < 3; i++) {
    await prisma.projectMember.create({
      data: {
        projectId: projects[i].id,
        userId: studentUsers[i].id,
        roleInProject: 'LEAD',
      },
    });
  }

  // Add second member to first project
  await prisma.projectMember.create({
    data: {
      projectId: projects[0].id,
      userId: studentUsers[1].id,
      roleInProject: 'MEMBER',
    },
  });

  // Add advisors (faculty as main advisors)
  for (let i = 0; i < 3; i++) {
    await prisma.projectAdvisor.create({
      data: {
        projectId: projects[i].id,
        userId: facultyUsers[i % facultyUsers.length].id,
        advisorRole: 'MAIN',
      },
    });
  }

  // Add milestone template to first 3 completed projects
  for (let i = 0; i < 3; i++) {
    await prisma.project.update({
      where: { id: projects[i].id },
      data: { milestoneTemplateId: templateId },
    });
  }

  console.log(`   ✓ Created ${projects.length} projects with members and advisors`);
  return projects;
}

async function seedTags(projects: Array<{ id: number }>) {
  console.log('🏷️  Seeding tags...');

  const tags = [
    { name: 'Web Development', slug: 'web-development', type: 'manual' as const },
    { name: 'Machine Learning', slug: 'machine-learning', type: 'manual' as const },
    { name: 'IoT', slug: 'iot', type: 'manual' as const },
    { name: 'Blockchain', slug: 'blockchain', type: 'manual' as const },
    { name: 'Virtual Reality', slug: 'virtual-reality', type: 'manual' as const },
    { name: 'Education', slug: 'education', type: 'ai_generated' as const },
    { name: 'Security', slug: 'security', type: 'manual' as const },
    { name: 'Sustainability', slug: 'sustainability', type: 'ai_generated' as const },
  ];

  const createdTags: Array<{ id: number }> = [];
  for (const tag of tags) {
    const t = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    createdTags.push(t);
  }

  // Link tags to projects
  const projectTagLinks = [
    { projectId: projects[0].id, tagId: createdTags[0].id }, // Smart Campus → Web Development
    { projectId: projects[0].id, tagId: createdTags[5].id }, // Smart Campus → Education
    { projectId: projects[1].id, tagId: createdTags[1].id }, // AI Tutor → Machine Learning
    { projectId: projects[1].id, tagId: createdTags[5].id }, // AI Tutor → Education
    { projectId: projects[2].id, tagId: createdTags[2].id }, // Energy Monitor → IoT
    { projectId: projects[2].id, tagId: createdTags[7].id }, // Energy Monitor → Sustainability
    { projectId: projects[3].id, tagId: createdTags[3].id }, // Blockchain Cred → Blockchain
    { projectId: projects[3].id, tagId: createdTags[6].id }, // Blockchain Cred → Security
    { projectId: projects[4].id, tagId: createdTags[4].id }, // VR Lab → Virtual Reality
    { projectId: projects[4].id, tagId: createdTags[5].id }, // VR Lab → Education
  ];

  for (const link of projectTagLinks) {
    await prisma.projectTag.create({
      data: {
        ...link,
        source: 'manual',
      },
    });
  }

  console.log(`   ✓ Created ${createdTags.length} tags with ${projectTagLinks.length} project links`);
}

async function seedCommentsAndRatings(
  projects: Array<{ id: number }>,
  facultyUsers: Array<{ id: number }>,
  studentUsers: Array<{ id: number }>,
  reviewer: { id: number },
) {
  console.log('💬 Seeding comments and ratings...');

  // Comments on approved projects
  const comments = [
    { projectId: projects[0].id, userId: facultyUsers[0].id, content: 'Excellent work on the campus management system. The architecture is well-designed and scalable.' },
    { projectId: projects[0].id, userId: reviewer.id, content: 'The documentation could be improved with more diagrams. Otherwise, solid implementation.' },
    { projectId: projects[1].id, userId: facultyUsers[1].id, content: 'The ML model shows promising results. Consider adding cross-validation in your evaluation methodology.' },
    { projectId: projects[1].id, userId: studentUsers[2].id, content: 'Great project! The NLP features are really impressive. Would love to collaborate on future work.' },
    { projectId: projects[2].id, userId: facultyUsers[2].id, content: 'Good use of IoT sensors. The real-time dashboard is particularly well-executed.' },
  ];

  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }

  // Ratings on completed/approved projects
  const ratings = [
    { projectId: projects[0].id, userId: facultyUsers[0].id, rating: 5, review: 'Outstanding graduation project with real-world applicability.' },
    { projectId: projects[0].id, userId: reviewer.id, rating: 4, review: 'Very good work. Minor improvements needed in documentation.' },
    { projectId: projects[1].id, userId: facultyUsers[1].id, rating: 5, review: 'Innovative use of AI in education. Well-researched and implemented.' },
    { projectId: projects[2].id, userId: facultyUsers[2].id, rating: 4, review: 'Solid engineering work with practical energy-saving impact.' },
    { projectId: projects[2].id, userId: reviewer.id, rating: 4, review: 'Good research methodology and clear presentation of results.' },
  ];

  for (const rating of ratings) {
    await prisma.rating.create({ data: rating });
  }

  console.log(`   ✓ Created ${comments.length} comments and ${ratings.length} ratings`);
}

async function seedFiles(
  projects: Array<{ id: number }>,
  studentUsers: Array<{ id: number }>,
) {
  console.log('📎 Seeding files...');

  const files = [
    {
      projectId: projects[0].id,
      uploadedByUserId: studentUsers[0].id,
      filename: 'smart-campus-report.pdf',
      originalFilename: 'Smart_Campus_Final_Report.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(2_450_000),
      storageUrl: '/files/projects/1/smart-campus-report.pdf',
      isPublic: true,
    },
    {
      projectId: projects[0].id,
      uploadedByUserId: studentUsers[0].id,
      filename: 'smart-campus-presentation.pptx',
      originalFilename: 'Smart_Campus_Presentation.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      sizeBytes: BigInt(5_120_000),
      storageUrl: '/files/projects/1/smart-campus-presentation.pptx',
      isPublic: true,
    },
    {
      projectId: projects[1].id,
      uploadedByUserId: studentUsers[1].id,
      filename: 'ai-tutor-report.pdf',
      originalFilename: 'AI_Learning_Assistant_Report.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(3_200_000),
      storageUrl: '/files/projects/2/ai-tutor-report.pdf',
      isPublic: true,
    },
    {
      projectId: projects[2].id,
      uploadedByUserId: studentUsers[2].id,
      filename: 'energy-monitor-report.pdf',
      originalFilename: 'Energy_Monitoring_Platform_Report.pdf',
      mimeType: 'application/pdf',
      sizeBytes: BigInt(4_100_000),
      storageUrl: '/files/projects/3/energy-monitor-report.pdf',
      isPublic: true,
    },
    {
      projectId: projects[2].id,
      uploadedByUserId: studentUsers[2].id,
      filename: 'energy-data.xlsx',
      originalFilename: 'Energy_Consumption_Data.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sizeBytes: BigInt(850_000),
      storageUrl: '/files/projects/3/energy-data.xlsx',
      isPublic: false,
    },
  ];

  for (const file of files) {
    await prisma.file.create({ data: file });
  }

  console.log(`   ✓ Created ${files.length} files`);
}

async function seedActivities(
  projects: Array<{ id: number }>,
  studentUsers: Array<{ id: number }>,
  adminId: number,
) {
  console.log('📊 Seeding project activities...');

  const activities = [
    { projectId: projects[0].id, userId: studentUsers[0].id, activityType: 'created', title: 'Project created', description: 'Smart Campus Management System project was created.' },
    { projectId: projects[0].id, userId: studentUsers[0].id, activityType: 'status_changed', title: 'Status changed to submitted', description: 'Project submitted for review.' },
    { projectId: projects[0].id, userId: adminId, activityType: 'approved', title: 'Project approved', description: 'Project approved by administrator.' },
    { projectId: projects[0].id, userId: studentUsers[0].id, activityType: 'status_changed', title: 'Status changed to completed', description: 'Project marked as completed.' },
    { projectId: projects[1].id, userId: studentUsers[1].id, activityType: 'created', title: 'Project created', description: 'AI-Powered Learning Assistant project was created.' },
    { projectId: projects[1].id, userId: adminId, activityType: 'approved', title: 'Project approved', description: 'Project approved by administrator.' },
  ];

  for (const activity of activities) {
    await prisma.projectActivity.create({ data: activity });
  }

  console.log(`   ✓ Created ${activities.length} project activities`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  Fahras — Database Seed');
  console.log('═══════════════════════════════════════════');
  console.log('');

  // Clean existing data in reverse dependency order
  console.log('🗑️  Cleaning existing data...');
  await prisma.projectActivity.deleteMany();
  await prisma.projectFlag.deleteMany();
  await prisma.projectFollower.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.projectAiMetadata.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.milestoneTemplateItem.deleteMany();
  await prisma.milestoneTemplate.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.file.deleteMany();
  await prisma.projectAdvisor.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.searchQuery.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.permissionRole.deleteMany();
  await prisma.roleUser.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  console.log('   ✓ Cleaned all tables');
  console.log('');

  // Seed in dependency order
  const roles = await seedRoles();
  const permissions = await seedPermissions();
  await seedPermissionRoles(roles, permissions);
  const departments = await seedDepartments();
  const programs = await seedPrograms(departments);
  const { admin, facultyUsers, studentUsers, reviewer } = await seedUsers(roles, departments, programs);
  const template = await seedMilestoneTemplate(admin.id);
  const projects = await seedProjects(studentUsers, facultyUsers, programs, template.id);
  await seedTags(projects);
  await seedCommentsAndRatings(projects, facultyUsers, studentUsers, reviewer);
  await seedFiles(projects, studentUsers);
  await seedActivities(projects, studentUsers, admin.id);

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ Seed completed successfully!');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  Default credentials:');
  console.log('  ─────────────────────────────────────────');
  console.log('  Admin:    admin@fahras.edu / password');
  console.log('  Faculty:  sarah.johnson@fahras.edu / password');
  console.log('  Student:  ahmed.almansouri@student.fahras.edu / password');
  console.log('  Reviewer: reviewer@fahras.edu / password');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
