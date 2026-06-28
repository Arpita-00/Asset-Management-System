const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { generateQrCode } = require('../utils/qrCodeGenerator');
const {
  Department, Vendor, Employee, AssetCategory, Asset,
  AssetAllocation, MaintenanceRequest, WarrantyTracking,
  AuditLog, AssetMovement, Notification, User
} = require('../models');

/**
 * Shared seeding function to avoid duplicate logic.
 * Seeds exactly 30+ items for each model.
 */
async function runSeeding() {
  // Get default admin user for relations
  const adminUser = await User.findOne({ where: { email: 'admin@company.com' } });
  const adminId = adminUser ? adminUser.id : 1;

  // 1. Seed 30 Railway Departments
  const departmentsData = [
    { name: 'Signaling & Telecommunication (S&T)', code: 'ST', description: 'Railway signaling, interlocking, and communication' },
    { name: 'Electrical (General)', code: 'EGEN', description: 'Station lighting and power distribution' },
    { name: 'Traction Distribution (TRD)', code: 'TRD', description: 'Overhead lines and substation power' },
    { name: 'Civil Engineering', code: 'CIVIL', description: 'Tracks, bridges, and buildings maintenance' },
    { name: 'Mechanical (Carriage & Wagon)', code: 'MECH', description: 'Trains, coaches, and wagons repair' },
    { name: 'Operating (Traffic)', code: 'OPS', description: 'Train operations, routing, and station masters' },
    { name: 'Commercial', code: 'COMM', description: 'Ticket booking, parcels, and passenger amenities' },
    { name: 'Security (RPF)', code: 'RPF', description: 'Railway Protection Force security control' },
    { name: 'Safety', code: 'SAFE', description: 'Safety inspections, audits, and disaster management' },
    { name: 'Accounts & Finance', code: 'ACCT', description: 'Financial accounting and audits' },
    { name: 'Personnel (HR)', code: 'HR', description: 'Human resources and staff coordination' },
    { name: 'Medical', code: 'MED', description: 'Railway hospitals and station health units' },
    { name: 'Materials Management (Stores)', code: 'STOR', description: 'Procurement and inventory management' },
    { name: 'Zonal Data Center', code: 'DC', description: 'Central servers and network hub' },
    { name: 'Divisional Control Room', code: 'CTRL', description: 'Divisional traffic and signaling control' },
    { name: 'Platform Operations', code: 'PFM', description: 'Platform management and display boards' },
    { name: 'Coach Maintenance Depot', code: 'COACH', description: 'Coach washing and repair shed' },
    { name: 'Traction Substation (TSS)', code: 'TSS', description: 'Power grid connection for trains' },
    { name: 'General Administration', code: 'ADMIN', description: 'General administration and management' },
    { name: 'Public Relations (PR)', code: 'PR', description: 'Zonal communications and media relations' },
    { name: 'Vigilance Department', code: 'VIG', description: 'Anti-corruption and quality audits' },
    { name: 'Yard Control Management', code: 'YARD', description: 'Yard shunting and line routing' },
    { name: 'Cargo & Freight Operations', code: 'FRHT', description: 'Goods shed and freight handling' },
    { name: 'Ticket Booking Operations', code: 'BOOK', description: 'Divisional ticketing counters' },
    { name: 'Crew Booking Depot', code: 'CREW', description: 'Loco pilot and guard sign-on/sign-off' },
    { name: 'Loco Shed Maintenance', code: 'LOCO', description: 'Locomotive maintenance and overhaul' },
    { name: 'Disaster Management Unit', code: 'DMU', description: 'Emergency response and rescue trains' },
    { name: 'IT Helpdesk & Networking', code: 'IT', description: 'IT assistance and system maintenance' },
    { name: 'Track Machine Unit', code: 'TMU', description: 'Heavy track tamping machines maintenance' },
    { name: 'Railway Workshop', code: 'WKSP', description: 'Major manufacturing and engineering overhaul' }
  ];
  const departments = await Department.bulkCreate(departmentsData);
  logger.info(`✅ Seeded ${departments.length} Departments`);

  // 2. Seed 30 Railway/Industrial Vendors
  const vendorsData = [
    { name: 'Siemens Mobility India', vendorCode: 'SIEM-001', contactPerson: 'Mr. Anil Kumar', email: 'rail.sales@siemens.com', phone: '+91 98765 00010', address: 'BKC, Bandra East', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400051', gstin: '27AAAAA0010A1Z1', website: 'https://siemens.com', avgRating: '4.80', totalRatings: 10, isActive: true },
    { name: 'Alstom Transport India', vendorCode: 'ALST-002', contactPerson: 'Ms. Priya Sen', email: 'sales.india@alstom.com', phone: '+91 98765 00011', address: 'Whitefield Tech Park', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560066', gstin: '29AAAAA0011A1Z2', website: 'https://alstom.com', avgRating: '4.70', totalRatings: 8, isActive: true },
    { name: 'Trimble Navigation Ltd', vendorCode: 'TRIM-003', contactPerson: 'Mr. John Doe', email: 'gedo.sales@trimble.com', phone: '+91 98765 00012', address: 'Global Tech Park', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110001', gstin: '07AAAAA0012A1Z3', website: 'https://trimble.com', avgRating: '4.90', totalRatings: 12, isActive: true },
    { name: 'Honeywell Security Solutions', vendorCode: 'HNYW-004', contactPerson: 'Mr. Rakesh Roy', email: 'cctv.sales@honeywell.com', phone: '+91 98765 00013', address: 'Sector 48', city: 'Gurugram', state: 'Haryana', country: 'India', pincode: '122018', gstin: '06AAAAA0013A1Z4', website: 'https://honeywell.com', avgRating: '4.50', totalRatings: 6, isActive: true },
    { name: 'Schneider Electric India', vendorCode: 'SCHN-005', contactPerson: 'Ms. Neha Patel', email: 'ups.sales@schneider.com', phone: '+91 98765 00014', address: 'Industrial Area', city: 'Noida', state: 'Uttar Pradesh', country: 'India', pincode: '201301', gstin: '09AAAAA0014A1Z5', website: 'https://se.com', avgRating: '4.60', totalRatings: 9, isActive: true },
    { name: 'ABB Power Grid India', vendorCode: 'ABB-006', contactPerson: 'Mr. K. R. Rao', email: 'grid.sales@abb.com', phone: '+91 98765 00015', address: 'Maneja', city: 'Vadodara', state: 'Gujarat', country: 'India', pincode: '390013', gstin: '24AAAAA0015A1Z6', website: 'https://abb.com', avgRating: '4.75', totalRatings: 11, isActive: true },
    { name: 'Larsen & Toubro (L&T)', vendorCode: 'LT-007', contactPerson: 'Mr. Sanjay Jha', email: 'infra.sales@lntecc.com', phone: '+91 98765 00016', address: 'Mount Poonamallee Road', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600089', gstin: '33AAAAA0016A1Z7', website: 'https://lntecc.com', avgRating: '4.85', totalRatings: 15, isActive: true },
    { name: 'BHEL Electricals', vendorCode: 'BHEL-008', contactPerson: 'Mr. V. P. Singh', email: 'traction.sales@bhel.in', phone: '+91 98765 00017', address: 'Piplani', city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', pincode: '462022', gstin: '23AAAAA0017A1Z8', website: 'https://bhel.in', avgRating: '4.40', totalRatings: 7, isActive: true },
    { name: 'Crompton Greaves Power', vendorCode: 'CGP-009', contactPerson: 'Mr. Alok Gupta', email: 'transformer.sales@cgglobal.com', phone: '+91 98765 00018', address: 'Kanjurmarg East', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400042', gstin: '27AAAAA0018A1Z9', website: 'https://cgglobal.com', avgRating: '4.55', totalRatings: 9, isActive: true },
    { name: 'Tata Power Solar', vendorCode: 'TATA-010', contactPerson: 'Ms. Swati Roy', email: 'solar.sales@tatapower.com', phone: '+91 98765 00019', address: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560100', gstin: '29AAAAA0019A1ZA', website: 'https://tatapowersolar.com', avgRating: '4.65', totalRatings: 8, isActive: true },
    { name: 'Dell India Enterprise', vendorCode: 'DELL-011', contactPerson: 'Mr. Sachin Nair', email: 'enterprise@dell.com', phone: '+91 98765 00020', address: 'Inner Ring Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560071', gstin: '29AAAAA0020A1ZB', website: 'https://dell.in', avgRating: '4.70', totalRatings: 14, isActive: true },
    { name: 'HP Enterprise India', vendorCode: 'HPE-012', contactPerson: 'Ms. Preeti Sharma', email: 'servers@hpe.com', phone: '+91 98765 00021', address: 'Cyber City', city: 'Gurugram', state: 'Haryana', country: 'India', pincode: '122002', gstin: '06AAAAA0021A1ZC', website: 'https://hpe.com', avgRating: '4.68', totalRatings: 13, isActive: true },
    { name: 'Cisco Systems India', vendorCode: 'CSCO-013', contactPerson: 'Mr. Nitin Jadhav', email: 'switch.sales@cisco.com', phone: '+91 98765 00022', address: 'Tech Park', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560103', gstin: '29AAAAA0022A1ZD', website: 'https://cisco.in', avgRating: '4.90', totalRatings: 16, isActive: true },
    { name: 'Hikvision India Pvt Ltd', vendorCode: 'HIKV-014', contactPerson: 'Mr. Ravi Sawant', email: 'cctv@hikvisionindia.co.in', phone: '+91 98765 00023', address: 'Ghatkopar West', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400086', gstin: '27AAAAA0023A1ZE', website: 'https://hikvisionindia.com', avgRating: '4.50', totalRatings: 12, isActive: true },
    { name: 'APC by Schneider', vendorCode: 'APCC-015', contactPerson: 'Mr. Amit Verma', email: 'support@apc.co.in', phone: '+91 98765 00024', address: 'Bannerghatta Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560076', gstin: '29AAAAA0024A1ZF', website: 'https://apc.com', avgRating: '4.62', totalRatings: 10, isActive: true },
    { name: 'Kirloskar Oil Engines', vendorCode: 'KIRL-016', contactPerson: 'Mr. Rohan Deshmukh', email: 'generators@kirloskar.com', phone: '+91 98765 00025', address: 'Khadki', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411003', gstin: '27AAAAA0025A1ZG', website: 'https://kirloskar.com', avgRating: '4.58', totalRatings: 15, isActive: true },
    { name: 'Cummins India Ltd', vendorCode: 'CUMM-017', contactPerson: 'Mr. Sunil Patil', email: 'power.sales@cummins.com', phone: '+91 98765 00026', address: 'Balewadi', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411045', gstin: '27AAAAA0026A1ZH', website: 'https://cummins.com', avgRating: '4.70', totalRatings: 11, isActive: true },
    { name: 'Wipro Infotech Ltd', vendorCode: 'WIPR-018', contactPerson: 'Mr. Varun Sethi', email: 'it.solutions@wipro.com', phone: '+91 98765 00027', address: 'Sarjapur Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560035', gstin: '29AAAAA0027A1ZI', website: 'https://wipro.com', avgRating: '4.45', totalRatings: 9, isActive: true },
    { name: 'TCS Railway Systems', vendorCode: 'TCSR-019', contactPerson: 'Mr. Ayush Anand', email: 'rail.tech@tcs.com', phone: '+91 98765 00028', address: 'Nanakramguda', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500032', gstin: '36AAAAA0028A1ZJ', website: 'https://tcs.com', avgRating: '4.80', totalRatings: 13, isActive: true },
    { name: 'HCL Technologies Ltd', vendorCode: 'HCLT-020', contactPerson: 'Ms. Tanvi Gill', email: 'infrastructure@hcl.com', phone: '+91 98765 00029', address: 'Sector 126', city: 'Noida', state: 'Uttar Pradesh', country: 'India', pincode: '201304', gstin: '09AAAAA0029A1ZK', website: 'https://hcltech.com', avgRating: '4.50', totalRatings: 10, isActive: true },
    { name: 'Bosch Security Systems', vendorCode: 'BOSC-021', contactPerson: 'Mr. Kartik Khanna', email: 'security@bosch.com', phone: '+91 98765 00030', address: 'Hosur Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560030', gstin: '29AAAAA0030A1ZL', website: 'https://boschsecurity.com', avgRating: '4.72', totalRatings: 8, isActive: true },
    { name: 'Hitachi Rail India', vendorCode: 'HITA-022', contactPerson: 'Mr. Vivek Jadhav', email: 'signaling@hitachi-rail.com', phone: '+91 98765 00031', address: 'Connaught Place', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110001', gstin: '07AAAAA0031A1ZM', website: 'https://hitachirail.com', avgRating: '4.88', totalRatings: 9, isActive: true },
    { name: 'GE Transportation India', vendorCode: 'GETR-023', contactPerson: 'Mr. Harish Sandhu', email: 'loco.sales@ge.com', phone: '+91 98765 00032', address: 'Chanakyapuri', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110021', gstin: '07AAAAA0032A1ZN', website: 'https://ge.com', avgRating: '4.65', totalRatings: 6, isActive: true },
    { name: 'Bombardier Rail India', vendorCode: 'BOMB-024', contactPerson: 'Mr. Pranav Bhasin', email: 'transit.sales@bombardier.com', phone: '+91 98765 00033', address: 'Vadodara-Halol Road', city: 'Vadodara', state: 'Gujarat', country: 'India', pincode: '391510', gstin: '24AAAAA0033A1ZO', website: 'https://bombardier.com', avgRating: '4.76', totalRatings: 7, isActive: true },
    { name: 'Kyosan India Pvt Ltd', vendorCode: 'KYOS-025', contactPerson: 'Mr. Kenji Sato', email: 'sales@kyosan.co.in', phone: '+91 98765 00034', address: 'DLF Cyber City', city: 'Gurugram', state: 'Haryana', country: 'India', pincode: '122002', gstin: '06AAAAA0034A1ZP', website: 'https://kyosan.co.in', avgRating: '4.82', totalRatings: 8, isActive: true },
    { name: 'Medha Servo Drives', vendorCode: 'MEDH-026', contactPerson: 'Mr. Y. S. Reddy', email: 'sales@medhaservo.com', phone: '+91 98765 00035', address: 'Cherlapally', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500051', gstin: '36AAAAA0035A1ZQ', website: 'https://medhaservo.com', avgRating: '4.80', totalRatings: 11, isActive: true },
    { name: 'Kernex Microsystems', vendorCode: 'KERN-027', contactPerson: 'Mr. M. S. Rao', email: 'tcash.sales@kernex.in', phone: '+91 98765 00036', address: 'Madhapur', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500081', gstin: '36AAAAA0036A1ZR', website: 'https://kernex.in', avgRating: '4.35', totalRatings: 5, isActive: true },
    { name: 'Texmaco Rail & Eng', vendorCode: 'TEXM-028', contactPerson: 'Mr. A. K. Sinha', email: 'wagons@texmaco.in', phone: '+91 98765 00037', address: 'Belgharia', city: 'Kolkata', state: 'West Bengal', country: 'India', pincode: '700056', gstin: '19AAAAA0037A1ZS', website: 'https://texmaco.in', avgRating: '4.42', totalRatings: 8, isActive: true },
    { name: 'Titagarh Rail Systems', vendorCode: 'TITA-029', contactPerson: 'Mr. S. K. Roy', email: 'metro.sales@titagarh.in', phone: '+91 98765 00038', address: 'Chowringhee Road', city: 'Kolkata', state: 'West Bengal', country: 'India', pincode: '700071', gstin: '19AAAAA0038A1ZT', website: 'https://titagarh.in', avgRating: '4.74', totalRatings: 10, isActive: true },
    { name: 'BEML India Ltd', vendorCode: 'BEML-030', contactPerson: 'Mr. G. P. Nayak', email: 'coaches@beml.co.in', phone: '+91 98765 00039', address: 'Double Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560027', gstin: '29AAAAA0039A1ZU', website: 'https://bemlindia.in', avgRating: '4.68', totalRatings: 12, isActive: true }
  ];
  const vendors = await Vendor.bulkCreate(vendorsData);
  logger.info(`✅ Seeded ${vendors.length} Vendors`);

  // 3. Seed 50 Railway Employees
  const employeesData = Array.from({ length: 50 }).map((_, i) => {
    const firstNames = [
      'Rajesh', 'Suresh', 'Amit', 'Priya', 'Neha', 'Rohan', 'Vikram', 'Anjali', 'Deepak', 'Jyoti',
      'Sunil', 'Karan', 'Meera', 'Ritu', 'Vijay', 'Rahul', 'Pooja', 'Sanjay', 'Arun', 'Kiran',
      'Preeti', 'Abhishek', 'Nitin', 'Divya', 'Shalini', 'Gaurav', 'Manish', 'Swati', 'Alok', 'Sachin',
      'Sneha', 'Vivek', 'Varun', 'Richa', 'Nisha', 'Aakash', 'Ravi', 'Simran', 'Tanvi', 'Ayush',
      'Pranav', 'Payal', 'Harish', 'Kartik', 'Shruti', 'Aniket', 'Komal', 'Tushar', 'Yash', 'Ishita'
    ];
    const lastNames = [
      'Sharma', 'Verma', 'Kumar', 'Patel', 'Singh', 'Gupta', 'Joshi', 'Mehta', 'Reddy', 'Rao',
      'Nair', 'Sharma', 'Mishra', 'Choudhury', 'Pandey', 'Saxena', 'Bose', 'Das', 'Sen', 'Roy',
      'Iyer', 'Pillai', 'Deshmukh', 'Kulkarni', 'Joshi', 'Bhat', 'Rao', 'Shetty', 'Hegde', 'Gowda',
      'Nayak', 'Sawant', 'Jadhav', 'Kadam', 'Shinde', 'Patil', 'Joshi', 'Mahajan', 'Kapoor', 'Malhotra',
      'Sethi', 'Bhasin', 'Oberoi', 'Khanna', 'Anand', 'Gill', 'Ahluwalia', 'Sandhu', 'Dhillon', 'Bansal'
    ];
    const designations = [
      'Senior Signal Engineer', 'Station Master', 'Electrical Maintainer', 'Safety Officer', 'Loco Pilot',
      'Assistant Station Master', 'Section Engineer', 'Track Maintainer', 'RPF Inspector', 'Chief Booking Clerk',
      'Traction Engineer', 'Store Keeper', 'IT Administrator', 'Medical Officer', 'Warden',
      'Junior Clerk', 'Duty Officer', 'Maintenance Technician', 'Signal Inspector', 'Power Controller'
    ];

    const dep = departments[i % departments.length];
    const firstName = firstNames[i];
    const lastName = lastNames[i];

    return {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ecor.railnet.gov.in`,
      phone: `+91 99887 000${10 + i}`,
      departmentId: dep.id,
      designation: designations[i % designations.length],
      employeeCode: `EMP-${1000 + i}`,
      joinDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000) * (1 + (i % 3)))
    };
  });
  const employees = await Employee.bulkCreate(employeesData);
  logger.info(`✅ Seeded ${employees.length} Employees`);

  // 4. Seed Asset Categories
  const categoriesData = [
    { name: 'Signal Controllers' },
    { name: 'Point Machines' },
    { name: 'Railway Servers' },
    { name: 'Track Inspection Devices' },
    { name: 'UPS Systems' },
    { name: 'Platform Display Boards' },
    { name: 'Network Switches' },
    { name: 'Ticket Counter PCs' },
    { name: 'Railway CCTV' },
    { name: 'Generators' },
    { name: 'Office Furniture' },
    { name: 'Software Licenses' },
    { name: 'Printers & Plotters' }
  ];
  const categories = await AssetCategory.bulkCreate(categoriesData);
  logger.info(`✅ Seeded ${categories.length} Asset Categories`);

  // 5. Seed 30 Railway Assets
  const railwayAssetsData = [
    { name: 'Siemens Westrace II Signal Controller', categoryIndex: 0, brand: 'Siemens', model: 'Westrace II', cost: 650000, img: 'uploads/assets/routers.png', location: 'Bhubaneswar West Relay Room' },
    { name: 'Alstom S700K Point Machine', categoryIndex: 1, brand: 'Alstom', model: 'S700K', cost: 120000, img: 'uploads/assets/vehicles.png', location: 'Cuttack Yard Point 4A' },
    { name: 'Trimble GEDO CE Track Inspection Device', categoryIndex: 3, brand: 'Trimble', model: 'GEDO CE', cost: 850000, img: 'uploads/assets/projectors.png', location: 'Khurda Road Depot' },
    { name: 'APC Smart-UPS 5kVA System', categoryIndex: 4, brand: 'APC', model: 'Smart-UPS 5kVA', cost: 95000, img: 'uploads/assets/ups_systems.png', location: 'Cuttack Yard Relay Room' },
    { name: 'Honeywell IP-Bullet 5MP CCTV', categoryIndex: 8, brand: 'Honeywell', model: 'IP-Bullet 5MP', cost: 12000, img: 'uploads/assets/cctv_cameras.png', location: 'Bhubaneswar Platform 1' },
    { name: 'Kirloskar 100kVA Silent Generator', categoryIndex: 9, brand: 'Kirloskar', model: '100kVA Silent', cost: 450000, img: 'uploads/assets/vehicles.png', location: 'Puri Loco Shed' },
    { name: 'HP ProLiant Command Server', categoryIndex: 2, brand: 'HP', model: 'ProLiant DL380', cost: 350000, img: 'uploads/assets/servers.png', location: 'Puri Zonal Data Center' },
    { name: 'Cisco Catalyst 9300 Network Switch', categoryIndex: 6, brand: 'Cisco', model: 'Catalyst 9300', cost: 65000, img: 'uploads/assets/switches.png', location: 'Bhubaneswar IT Hub' },
    { name: 'Dell OptiPlex Ticket Counter PC', categoryIndex: 7, brand: 'Dell', model: 'OptiPlex 7090', cost: 55000, img: 'uploads/assets/desktops.png', location: 'Khurda Road Ticketing Office' },
    { name: 'Siemens AzS Track Axle Counter', categoryIndex: 0, brand: 'Siemens', model: 'AzS Axle Counter', cost: 280000, img: 'uploads/assets/routers.png', location: 'Palasa Block Cabin B' },
    { name: 'Alstom Track Circuit Diagnostician', categoryIndex: 3, brand: 'Alstom', model: 'DiagTrack-10', cost: 380000, img: 'uploads/assets/projectors.png', location: 'Angul Track Machine Shed' },
    { name: 'Schneider Electric 10kVA UPS', categoryIndex: 4, brand: 'Schneider', model: 'Easy UPS 10kVA', cost: 150000, img: 'uploads/assets/ups_systems.png', location: 'Bhubaneswar East Cabin Room' },
    { name: 'Hikvision 360 PTZ Camera', categoryIndex: 8, brand: 'Hikvision', model: 'DS-2CD PTZ', cost: 25000, img: 'uploads/assets/cctv_cameras.png', location: 'Cuttack Main Entrance' },
    { name: 'Cummins 250kVA Emergency Generator', categoryIndex: 9, brand: 'Cummins', model: '250kVA Power', cost: 750000, img: 'uploads/assets/vehicles.png', location: 'Khurda Road Main Substation' },
    { name: 'Lenovo ThinkSystem Database Server', categoryIndex: 2, brand: 'Lenovo', model: 'ThinkSystem SR650', cost: 290000, img: 'uploads/assets/servers.png', location: 'Bhubaneswar Zonal Server Room' },
    { name: 'Aruba CX 6200 Core Switch', categoryIndex: 6, brand: 'Aruba', model: 'CX 6200', cost: 78000, img: 'uploads/assets/switches.png', location: 'Cuttack Control Room' },
    { name: 'HP EliteBook Booking Laptop', categoryIndex: 7, brand: 'HP', model: 'EliteBook 840', cost: 85000, img: 'uploads/assets/laptops.png', location: 'Puri PRS Counter 3' },
    { name: 'Kyosan Electronic Interlocking Unit', categoryIndex: 0, brand: 'Kyosan', model: 'EI-100', cost: 920000, img: 'uploads/assets/routers.png', location: 'Puri Station Relay Room' },
    { name: 'Medha MAS Loco Controller', categoryIndex: 0, brand: 'Medha', model: 'MAS Loco Controller', cost: 420000, img: 'uploads/assets/routers.png', location: 'Visakhapatnam Loco Shed' },
    { name: 'Amara Raja 110V Traction Battery', categoryIndex: 4, brand: 'Amara Raja', model: 'Traction Battery 110V', cost: 180000, img: 'uploads/assets/ups_systems.png', location: 'Bhadrak Substation Unit 2' },
    { name: 'Crompton Greaves 25kVA Transformer', categoryIndex: 4, brand: 'Crompton Greaves', model: '25kVA', cost: 320000, img: 'uploads/assets/ups_systems.png', location: 'Jajpur Keonjhar Road Substation' },
    { name: 'ABB 11kV Vacuum Circuit Breaker', categoryIndex: 4, brand: 'ABB', model: '11kV VCB', cost: 240000, img: 'uploads/assets/ups_systems.png', location: 'Cuttack TSS' },
    { name: 'L&T Smart Energy Metering', categoryIndex: 4, brand: 'L&T', model: 'Smart Metering', cost: 45000, img: 'uploads/assets/ups_systems.png', location: 'Bhubaneswar Divisional HQ' },
    { name: 'Parijat VHF Radio Handset', categoryIndex: 0, brand: 'Parijat', model: 'VHF Handset', cost: 15000, img: 'uploads/assets/routers.png', location: 'Puri Yard Cabin' },
    { name: 'Trimble MX9 Mobile LiDAR Scanner', categoryIndex: 3, brand: 'Trimble', model: 'MX9 Mobile LiDAR', cost: 1850000, img: 'uploads/assets/projectors.png', location: 'Divisional Engineering Stores' },
    { name: 'Sony PDB 4K Platform Display Board', categoryIndex: 5, brand: 'Sony', model: 'PDB 4K Display', cost: 95000, img: 'uploads/assets/desktops.png', location: 'Bhubaneswar Platform 2 East' },
    { name: 'Samsung 55 LED Passenger Info Screen', categoryIndex: 5, brand: 'Samsung', model: '55 Passenger Screen', cost: 65000, img: 'uploads/assets/desktops.png', location: 'Cuttack Main Waiting Hall' },
    { name: 'Featherlite Station Control Chair', categoryIndex: 10, brand: 'Featherlite', model: 'Station Control Chair', cost: 18000, img: 'uploads/assets/furniture.png', location: 'Puri Station Master Cabin' },
    { name: 'Godrej Fire Safe Cabinet', categoryIndex: 10, brand: 'Godrej', model: 'Fire Safe Cabinet', cost: 35000, img: 'uploads/assets/furniture.png', location: 'Divisional Records Room' },
    { name: 'Canon imageRUNNER Printer', categoryIndex: 12, brand: 'Canon', model: 'imageRUNNER Printer', cost: 85000, img: 'uploads/assets/printers.png', location: 'Bhubaneswar DRM Office' }
  ];

  const assetsData = [];
  const statuses = ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'DISPOSED'];

  for (let i = 0; i < railwayAssetsData.length; i++) {
    const rawAsset = railwayAssetsData[i];
    const category = categories[rawAsset.categoryIndex];
    
    // Balance statuses: mostly ASSIGNED and AVAILABLE
    let status = 'AVAILABLE';
    if (i % 6 === 0) status = 'UNDER_REPAIR';
    else if (i % 10 === 0) status = 'DISPOSED';
    else if (i % 2 === 0) status = 'ASSIGNED';

    const dep = departments[i % departments.length];
    const emp = status === 'ASSIGNED' ? employees[i % employees.length] : null;
    const vendor = vendors[i % vendors.length];

    const purchaseDate = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000) * (0.5 + (i % 4) * 0.5));
    const expDays = status === 'DISPOSED' ? -100 : (365 * (1 + (i % 3)));
    const expiryDate = new Date(purchaseDate.getTime() + (expDays * 24 * 60 * 60 * 1000));

    // Calculate depreciated current value
    const ageInYears = (Date.now() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
    const deprecRate = 0.15; // 15% straight line/reducing
    const currentValue = Math.max(0, Math.round(rawAsset.cost * Math.pow(1 - deprecRate, ageInYears)));

    const assetSeq = String(i + 1).padStart(6, '0');
    const tag = `AST-2026-${assetSeq}`;

    assetsData.push({
      name: rawAsset.name,
      assetTag: tag,
      assetUniqueId: tag,
      categoryId: category.id,
      brand: rawAsset.brand,
      model: rawAsset.model,
      serialNumber: `SN-${rawAsset.brand.substring(0, 3).toUpperCase()}${i * 98765}`,
      purchaseDate,
      purchaseCost: rawAsset.cost,
      currentValue,
      vendorId: vendor.id,
      departmentId: dep.id,
      assignedToId: emp ? emp.id : null,
      location: rawAsset.location,
      warrantyExpiry: expiryDate,
      imageUrl: rawAsset.img,
      status,
      qrCodeUrl: `/uploads/qr/${tag}.png`,
      createdById: adminId
    });
  }

  const assets = await Asset.bulkCreate(assetsData);
  logger.info(`✅ Seeded ${assets.length} Assets`);

  // Generate QR code images on-the-fly for all seeded assets in the background to prevent HTTP timeout
  setImmediate(async () => {
    logger.info('Generating physical QR code images on disk in background...');
    for (const asset of assets) {
      try {
        await generateQrCode(asset.assetUniqueId || asset.assetTag);
      } catch (qrErr) {
        logger.warn(`Could not generate QR code file for ${asset.assetTag}: ${qrErr.message}`);
      }
    }
  });

  // 6. Seed 50 Asset Assignments (Allocations)
  const allocationsData = [];
  // First, seed returned historical assignments
  for (let i = 0; i < 25; i++) {
    const asset = assets[i % assets.length];
    const emp = employees[(i + 5) % employees.length];
    const allocatedDate = new Date(new Date(asset.purchaseDate).getTime() + (10 * 24 * 60 * 60 * 1000));
    const expectedReturn = new Date(allocatedDate.getTime() + (90 * 24 * 60 * 60 * 1000));
    const actualReturn = new Date(expectedReturn.getTime() - (5 * 24 * 60 * 60 * 1000));

    allocationsData.push({
      assetId: asset.id,
      employeeId: emp.id,
      allocatedById: adminId,
      returnedToId: adminId,
      allocatedDate,
      expectedReturn,
      actualReturn,
      status: 'RETURNED',
      purpose: 'Temporary project requirement',
      notes: 'Asset returned in good condition.'
    });
  }

  // Next, seed current active assignments for assets that are marked ASSIGNED
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    if (asset.status === 'ASSIGNED') {
      const emp = employees[i % employees.length];
      const allocatedDate = new Date(new Date(asset.purchaseDate).getTime() + (15 * 24 * 60 * 60 * 1000));
      const expectedReturn = new Date(allocatedDate.getTime() + (365 * 24 * 60 * 60 * 1000));

      allocationsData.push({
        assetId: asset.id,
        employeeId: emp.id,
        allocatedById: adminId,
        allocatedDate,
        expectedReturn,
        status: 'ACTIVE',
        purpose: 'Official workspace deployment',
        notes: 'Standard assignment.'
      });
    }
  }

  // If we need more assignments to reach 50
  const currentAllocCount = allocationsData.length;
  if (currentAllocCount < 50) {
    const diff = 50 - currentAllocCount;
    for (let i = 0; i < diff; i++) {
      const asset = assets[(i * 3) % assets.length];
      const emp = employees[(i * 2) % employees.length];
      const allocatedDate = new Date(new Date(asset.purchaseDate).getTime() + (5 * 24 * 60 * 60 * 1000));
      const expectedReturn = new Date(allocatedDate.getTime() + (60 * 24 * 60 * 60 * 1000));
      const actualReturn = new Date(expectedReturn.getTime());

      allocationsData.push({
        assetId: asset.id,
        employeeId: emp.id,
        allocatedById: adminId,
        returnedToId: adminId,
        allocatedDate,
        expectedReturn,
        actualReturn,
        status: 'RETURNED',
        purpose: 'Training event usage',
        notes: 'Returned.'
      });
    }
  }

  const allocations = await AssetAllocation.bulkCreate(allocationsData);
  logger.info(`✅ Seeded ${allocations.length} Asset Assignments`);

  // 7. Seed 30 Maintenance Records
  const maintenanceData = [];
  const issues = [
    'Calibration drift', 'Relay contact realignment', 'Laser sensor cleaning', 'Battery backup low',
    'Firmware update error', 'Network connection drop', 'Power port loose',
    'Mechanical joint lubrication', 'Display panel cracking', 'Air filter blocked', 'Chassis checkup',
    'Diagnostic tool error', 'Database crash recovery', 'Fuse blown'
  ];

  const issueTypeMapping = [
    'HARDWARE', 'HARDWARE', 'HARDWARE', 'HARDWARE',
    'SOFTWARE', 'NETWORK', 'HARDWARE',
    'HARDWARE', 'PHYSICAL_DAMAGE', 'ROUTINE', 'ROUTINE',
    'ROUTINE', 'SOFTWARE', 'HARDWARE'
  ];

  for (let i = 0; i < 30; i++) {
    const asset = assets[i % assets.length];
    const status = i % 5 === 0 ? 'OPEN' : (i % 8 === 0 ? 'IN_PROGRESS' : 'COMPLETED');
    const startDate = new Date(new Date(asset.purchaseDate).getTime() + (45 * 24 * 60 * 60 * 1000));
    const completedAt = status === 'COMPLETED' ? new Date(startDate.getTime() + (2 * 24 * 60 * 60 * 1000)) : null;

    maintenanceData.push({
      requestNumber: `REQ-${20000 + i}`,
      assetId: asset.id,
      issueType: issueTypeMapping[i % issueTypeMapping.length],
      title: issues[i % issues.length],
      description: `Detailed checkup and repair performed for issue: ${issues[i % issues.length]}`,
      startedAt: startDate,
      completedAt,
      status,
      actualCost: status === 'COMPLETED' ? Math.round(1500 * (1 + (i % 8))) : 0.00,
      estimatedCost: Math.round(1500 * (1 + (i % 8))),
      assignedTechnician: `Railway Maintainer Team ${1 + (i % 4)}`,
      requestedById: adminId
    });
  }
  const maintenanceRecords = await MaintenanceRequest.bulkCreate(maintenanceData);
  logger.info(`✅ Seeded ${maintenanceRecords.length} Maintenance Records`);

  // 8. Seed 30 Warranty Records
  const warrantyData = [];
  for (let i = 0; i < 30; i++) {
    const asset = assets[(i * 2) % assets.length];
    const expiry = new Date(new Date(asset.purchaseDate).getTime() + (365 * 24 * 60 * 60 * 1000));
    const vendor = vendors[i % vendors.length];
    const types = ['MANUFACTURER', 'EXTENDED', 'THIRD_PARTY', 'ON_SITE', 'COMPREHENSIVE'];

    warrantyData.push({
      assetId: asset.id,
      warrantyType: types[i % types.length],
      startDate: asset.purchaseDate,
      expiryDate: expiry,
      providerName: vendor.name,
      contractNumber: `WNT-${10000 + i}`,
      notes: 'Standard railways engineering support agreement.'
    });
  }
  const warranties = await WarrantyTracking.bulkCreate(warrantyData);
  logger.info(`✅ Seeded ${warranties.length} Warranty Records`);

  // 9. Seed 50 Audit Logs
  const auditData = Array.from({ length: 50 }).map((_, i) => {
    const actions = [
      'CREATE_ASSET', 'UPDATE_ASSET', 'ASSIGN_ASSET', 'RETURN_ASSET',
      'UPDATE_VENDORS', 'UPDATE_EMPLOYEE', 'ADD_MAINTENANCE', 'COMPLETE_MAINTENANCE'
    ];
    return {
      performedById: adminId,
      action: actions[i % actions.length],
      entityType: 'Asset',
      entityId: i + 1,
      description: `Performed system action ${actions[i % actions.length]} for record ID ${i + 1}`,
      ipAddress: `192.168.1.${10 + (i % 50)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0'
    };
  });
  const audits = await AuditLog.bulkCreate(auditData);
  logger.info(`✅ Seeded ${audits.length} Audit Logs`);

  // 10. Seed 50 Asset Movements
  const movementsData = [];
  for (let i = 0; i < 50; i++) {
    const asset = assets[i % assets.length];
    const depFrom = departments[i % departments.length];
    const depTo = departments[(i + 1) % departments.length];

    movementsData.push({
      assetId: asset.id,
      fromLocation: `Office Floor ${1 + (i % 4)}, Cabin ${10 + (i % 20)}`,
      toLocation: `Office Floor ${1 + ((i + 1) % 4)}, Relay Room ${20 + (i % 10)}`,
      fromDepartment: depFrom.name,
      toDepartment: depTo.name,
      movementDate: new Date(new Date(asset.purchaseDate).getTime() + (30 * 24 * 60 * 60 * 1000)),
      movedById: adminId
    });
  }
  const movements = await AssetMovement.bulkCreate(movementsData);
  logger.info(`✅ Seeded ${movements.length} Asset Movements`);

  // 11. Seed 30 Notifications
  const notificationsData = [];
  const notificationTitles = [
    'Asset Assigned', 'Asset Returned', 'Warranty Expiring Soon', 'Maintenance Completed'
  ];
  const messages = [
    'Asset has been assigned to employee successfully.',
    'Asset returned by employee and checked back in.',
    'Warranty for asset is expiring within the next 30 days.',
    'Maintenance work order has been completed by technician.'
  ];
  const types = ['ASSET_ASSIGNED', 'ASSET_RETURNED', 'WARRANTY_EXPIRING', 'MAINTENANCE_COMPLETE'];

  for (let i = 0; i < 30; i++) {
    const index = i % 4;
    notificationsData.push({
      userId: adminId,
      title: notificationTitles[index],
      message: `${messages[index]} Asset Ref: AST-2026-${String(1 + (i % assets.length)).padStart(6, '0')}`,
      type: types[index],
      isRead: i % 3 === 0
    });
  }
  const notifications = await Notification.bulkCreate(notificationsData);
  logger.info(`✅ Seeded ${notifications.length} Notifications`);

  // Recalculate health scores
  try {
    const assetHealthService = require('../services/assetHealthService');
    await assetHealthService.recalculateAll();
    logger.info('✅ Health scores recalculated successfully');
  } catch (err) {
    logger.warn('⚠️ Could not run health score recalculation: ' + err.message);
  }
}

/**
 * Main seeding trigger checks if DB already contains data first.
 */
async function seedEnterpriseData() {
  try {
    const assetCount = await Asset.count();
    if (assetCount > 0) {
      logger.info('ℹ️ Database already contains enterprise asset data. Skipping seeding.');
      return;
    }

    logger.info('🌱 Seeding realistic ECoR Divisional database data...');
    await runSeeding();
    logger.info('🎉 Database seeding completed successfully!');
  } catch (error) {
    logger.error(`❌ Seeding database failed: ${error.message}`);
  }
}

/**
 * Reset database clears all tables and triggers a fresh seeding.
 */
async function resetAndSeedDatabase() {
  try {
    logger.info('🧹 Purging database records for seeding...');
    
    // Delete in reverse order of dependencies
    await Notification.destroy({ where: {}, force: true }).catch(() => {});
    await AssetMovement.destroy({ where: {}, force: true }).catch(() => {});
    await AuditLog.destroy({ where: {}, force: true }).catch(() => {});
    await WarrantyTracking.destroy({ where: {}, force: true }).catch(() => {});
    await MaintenanceRequest.destroy({ where: {}, force: true }).catch(() => {});
    await AssetAllocation.destroy({ where: {}, force: true }).catch(() => {});
    await Asset.destroy({ where: {}, force: true }).catch(() => {});
    await Employee.destroy({ where: {}, force: true }).catch(() => {});
    await Vendor.destroy({ where: {}, force: true }).catch(() => {});
    await AssetCategory.destroy({ where: {}, force: true }).catch(() => {});
    await Department.destroy({ where: {}, force: true }).catch(() => {});
    
    logger.info('🌱 Database purged. Initiating fresh seed...');
    await runSeeding();
    logger.info('🎉 Purge & Reseed of ECoR Divisional Demo Database completed successfully!');
    return true;
  } catch (error) {
    logger.error(`❌ Purge & Reseed database failed: ${error.message}`);
    throw error;
  }
}

module.exports = { seedEnterpriseData, resetAndSeedDatabase };
