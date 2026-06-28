const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const {
  Department, Vendor, Employee, AssetCategory, Asset,
  AssetAllocation, MaintenanceRequest, WarrantyTracking,
  AuditLog, AssetMovement, Notification, User
} = require('../models');

async function seedEnterpriseData() {
  try {
    // 1. Check if database is already seeded
    const assetCount = await Asset.count();
    if (assetCount > 0) {
      logger.info('ℹ️ Database already contains enterprise asset data. Skipping seeding.');
      return;
    }

    logger.info('🌱 Seeding realistic enterprise demo data...');

    // Get default users for relations
    const adminUser = await User.findOne({ where: { email: 'admin@company.com' } });
    const adminId = adminUser ? adminUser.id : 1;

    // 2. Seed 20 Departments
    const departmentsData = [
      { name: 'Information Technology' },
      { name: 'Human Resources' },
      { name: 'Finance & Accounts' },
      { name: 'Sales & Marketing' },
      { name: 'Operations & Logistics' },
      { name: 'Research & Development' },
      { name: 'Customer Support' },
      { name: 'Legal & Compliance' },
      { name: 'Procurement & Purchasing' },
      { name: 'Quality Assurance' },
      { name: 'Engineering & Maintenance' },
      { name: 'Administration & Facilities' },
      { name: 'Corporate Communications' },
      { name: 'Security & Safety' },
      { name: 'Public Relations' },
      { name: 'Business Development' },
      { name: 'Product Management' },
      { name: 'Design & Creative' },
      { name: 'Training & Enablement' },
      { name: 'Strategy & Planning' }
    ];
    const departments = await Department.bulkCreate(departmentsData);
    logger.info(`✅ Seeded ${departments.length} Departments`);

    // 3. Seed 20 Vendors
    const vendorsData = Array.from({ length: 20 }).map((_, i) => {
      const names = [
        'Dell India Tech', 'HP Enterprise Solutions', 'Lenovo Global Store', 'Apple Business Corp',
        'Cisco Systems Ltd', 'Canon Office World', 'Epson Digital Store', 'D-Link Networking',
        'Samsung Electronics', 'LG Commercial Displays', 'Blue Star Cooling', 'Voltas AC Labs',
        'Godrej Interio Office', 'Steelcase Furniture', 'Tata Motors Commercial', 'Mahindra Logistics',
        'Microsoft Licensing', 'AWS Services India', 'Oracle Database Solutions', 'Adobe Business Center'
      ];
      const name = names[i];
      const code = name.replace(/\s+/g, '').substring(0, 8).toUpperCase() + `-${100 + i}`;
      return {
        name,
        vendorCode: code,
        contactPerson: `Contact Person ${i + 1}`,
        email: `sales@${code.toLowerCase()}.com`,
        phone: `+91 98765 00${10 + i}`,
        address: `Commercial complex, Phase ${1 + (i % 5)}, Sector ${10 + i}, Tech City`,
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: `4000${10 + i}`,
        gstin: `27AAAAA00${10 + i}A1Z${i % 9}`,
        website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        avgRating: (4.0 + (i % 10) * 0.1).toFixed(2),
        totalRatings: 5 + (i % 5),
        isActive: true,
        notes: `Enterprise vendor for category ${i + 1}`
      };
    });
    const vendors = await Vendor.bulkCreate(vendorsData);
    logger.info(`✅ Seeded ${vendors.length} Vendors`);

    // 4. Seed 50 Employees
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
        'Software Engineer', 'Senior Engineer', 'Technical Lead', 'Product Manager', 'HR Executive',
        'HR Manager', 'Financial Analyst', 'Finance Manager', 'Marketing Executive', 'Sales Director',
        'Operations Manager', 'Database Administrator', 'Network Engineer', 'QA Specialist', 'Legal Counsel',
        'Facilities Executive', 'Support Engineer', 'Security Lead', 'PR Manager', 'Business Analyst'
      ];

      const dep = departments[i % departments.length];
      const firstName = firstNames[i];
      const lastName = lastNames[i];

      return {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        phone: `+91 99887 000${10 + i}`,
        departmentId: dep.id,
        designation: designations[i % designations.length],
        employeeCode: `EMP-${1000 + i}`,
        joinDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000) * (1 + (i % 3)))
      };
    });
    const employees = await Employee.bulkCreate(employeesData);
    logger.info(`✅ Seeded ${employees.length} Employees`);

    // 5. Seed Asset Categories
    const categoriesData = [
      { name: 'Laptops' },
      { name: 'Desktops' },
      { name: 'Printers' },
      { name: 'Servers' },
      { name: 'Routers' },
      { name: 'Switches' },
      { name: 'Projectors' },
      { name: 'Air Conditioners' },
      { name: 'Furniture' },
      { name: 'Vehicles' },
      { name: 'Software Licenses' },
      { name: 'CCTV Cameras' },
      { name: 'UPS Systems' }
    ];
    const categories = await AssetCategory.bulkCreate(categoriesData);
    logger.info(`✅ Seeded ${categories.length} Asset Categories`);

    // 6. Seed 100 Assets
    const assetsData = [];
    const categoryMapping = {
      'Laptops': { brands: ['Dell', 'HP', 'Apple', 'Lenovo'], models: ['Latitude 7440', 'EliteBook 840 G10', 'MacBook Pro 14', 'ThinkPad T14'], cost: 85000 },
      'Desktops': { brands: ['Dell', 'HP', 'Lenovo'], models: ['OptiPlex 7090', 'ProDesk 400', 'ThinkCentre M70q'], cost: 55000 },
      'Printers': { brands: ['HP', 'Canon', 'Epson'], models: ['LaserJet Pro M404dn', 'imageRUNNER 2206', 'EcoTank L3210'], cost: 25000 },
      'Servers': { brands: ['Dell', 'HP', 'Lenovo'], models: ['PowerEdge R750', 'ProLiant DL380 Gen10', 'ThinkSystem SR650'], cost: 250000 },
      'Routers': { brands: ['Cisco', 'Juniper', 'D-Link'], models: ['ISR 4331', 'SRX300', 'DSR-1000AC'], cost: 45000 },
      'Switches': { brands: ['Cisco', 'Aruba', 'D-Link'], models: ['Catalyst 9300', 'CX 6100', 'DGS-1510'], cost: 65000 },
      'Projectors': { brands: ['Epson', 'BenQ', 'Sony'], models: ['EB-E01', 'MX560', 'VPL-DX221'], cost: 35000 },
      'Air Conditioners': { brands: ['Voltas', 'Blue Star', 'Daikin'], models: ['Vectra 1.5T', 'Inverter split 1.5T', 'FTKF50'], cost: 42000 },
      'Furniture': { brands: ['Godrej Interio', 'Steelcase', 'Featherlite'], models: ['Workstation Table', 'Ergonomic Chair', 'Conference Table'], cost: 15000 },
      'Vehicles': { brands: ['Tata', 'Mahindra', 'Maruti'], models: ['Tigor EV', 'Bolero Neo', 'Eeco Cargo'], cost: 950000 },
      'Software Licenses': { brands: ['Microsoft', 'Adobe', 'Oracle'], models: ['Office 365 Enterprise', 'Creative Cloud', 'Java SE Subscription'], cost: 12000 },
      'CCTV Cameras': { brands: ['Hikvision', 'Dahua', 'CP Plus'], models: ['DS-2CD2043G2-I', 'IPC-HFW2431S-S-S2', 'CP-UNC-TA21L3'], cost: 12000 },
      'UPS Systems': { brands: ['APC', 'Microtek', 'Luminous'], models: ['Smart-UPS 1500VA', 'MAX+ 1000VA', 'Cruze 2KVA'], cost: 18000 }
    };

    const statuses = ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'DISPOSED'];

    for (let i = 0; i < 100; i++) {
      const category = categories[i % categories.length];
      const categoryConfig = categoryMapping[category.name];
      const brand = categoryConfig.brands[i % categoryConfig.brands.length];
      const model = categoryConfig.models[i % categoryConfig.models.length];
      const baseCost = categoryConfig.cost;
      const cost = Math.round(baseCost * (0.9 + (i % 5) * 0.05));

      // Balance statuses: mostly ASSIGNED and AVAILABLE
      let status = 'AVAILABLE';
      if (i % 10 === 0) status = 'UNDER_REPAIR';
      else if (i % 15 === 0) status = 'DISPOSED';
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
      const currentValue = Math.max(0, Math.round(cost * Math.pow(1 - deprecRate, ageInYears)));

      const assetSeq = String(i + 1).padStart(6, '0');
      const tag = `AST-2026-${assetSeq}`;

      assetsData.push({
        name: `${brand} ${model}`,
        assetTag: tag,
        assetUniqueId: tag,
        categoryId: category.id,
        brand,
        model,
        serialNumber: `SN-${brand.substring(0, 3).toUpperCase()}${i * 98765}`,
        purchaseDate,
        purchaseCost: cost,
        currentValue,
        vendorId: vendor.id,
        departmentId: dep.id,
        assignedToId: emp ? emp.id : null,
        location: `Office Floor ${1 + (i % 4)}, Desk ${10 + (i % 40)}`,
        warrantyExpiry: expiryDate,
        imageUrl: `uploads/assets/${category.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`,
        status,
        qrCodeUrl: `/uploads/qr/${tag}.png`,
        createdById: adminId
      });
    }

    const assets = await Asset.bulkCreate(assetsData);
    logger.info(`✅ Seeded ${assets.length} Assets`);

    // 7. Seed 150 Asset Assignments (Allocations)
    // To have 150 allocations for 100 assets, some assets will have previous returned/transferred assignments
    const allocationsData = [];
    let allocationCounter = 0;

    // First, seed returned historical assignments
    for (let i = 0; i < 75; i++) {
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

    // If we need more assignments to reach 150
    const currentAllocCount = allocationsData.length;
    if (currentAllocCount < 150) {
      const diff = 150 - currentAllocCount;
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

    // 8. Seed 50 Maintenance Records
    const maintenanceData = [];
    const issues = [
      'Screen flickering', 'Keyboard replaced', 'RAM upgrade required', 'Overheating issue',
      'Operating System reinstalled', 'Network card failure', 'Toner replacement',
      'Battery swollen', 'AC compressor replacement', 'AC filter cleanup', 'Wheel alignment',
      'License renewal', 'HDD crash recovery', 'Power supply issue'
    ];

    const issueTypeMapping = [
      'HARDWARE', 'HARDWARE', 'HARDWARE', 'HARDWARE',
      'SOFTWARE', 'NETWORK', 'HARDWARE',
      'HARDWARE', 'PHYSICAL_DAMAGE', 'ROUTINE', 'ROUTINE',
      'ROUTINE', 'SOFTWARE', 'HARDWARE'
    ];

    for (let i = 0; i < 50; i++) {
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
        assignedTechnician: `Technician Team ${1 + (i % 4)}`,
        requestedById: adminId
      });
    }
    const maintenanceRecords = await MaintenanceRequest.bulkCreate(maintenanceData);
    logger.info(`✅ Seeded ${maintenanceRecords.length} Maintenance Records`);

    // 9. Seed 50 Warranty Records
    const warrantyData = [];
    for (let i = 0; i < 50; i++) {
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
        notes: 'Standard enterprise warranty support.'
      });
    }
    const warranties = await WarrantyTracking.bulkCreate(warrantyData);
    logger.info(`✅ Seeded ${warranties.length} Warranty Records`);

    // 10. Seed 100 Audit Logs
    const auditData = Array.from({ length: 100 }).map((_, i) => {
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

    // 11. Seed 100 Asset Movements
    const movementsData = [];
    for (let i = 0; i < 100; i++) {
      const asset = assets[i % assets.length];
      const depFrom = departments[i % departments.length];
      const depTo = departments[(i + 1) % departments.length];

      movementsData.push({
        assetId: asset.id,
        fromLocation: `Office Floor ${1 + (i % 4)}, Desk ${10 + (i % 40)}`,
        toLocation: `Office Floor ${1 + ((i + 1) % 4)}, Room ${20 + (i % 10)}`,
        fromDepartment: depFrom.name,
        toDepartment: depTo.name,
        movementDate: new Date(new Date(asset.purchaseDate).getTime() + (30 * 24 * 60 * 60 * 1000)),
        movedById: adminId
      });
    }
    const movements = await AssetMovement.bulkCreate(movementsData);
    logger.info(`✅ Seeded ${movements.length} Asset Movements`);

    // 12. Seed 50 Notifications
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

    for (let i = 0; i < 50; i++) {
      const index = i % 4;
      notificationsData.push({
        userId: adminId,
        title: notificationTitles[index],
        message: `${messages[index]} Asset Ref: AST-${10000 + (i % assets.length)}`,
        type: types[index],
        isRead: i % 3 === 0
      });
    }
    const notifications = await Notification.bulkCreate(notificationsData);
    logger.info(`✅ Seeded ${notifications.length} Notifications`);

    logger.info('🎉 Seeded realistic enterprise demo data successfully!');
  } catch (error) {
    logger.error(`❌ Seeding enterprise demo data failed: ${error.message}`);
  }
}

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
    
    // Seed fresh data
    const adminUser = await User.findOne({ where: { email: 'admin@company.com' } });
    const adminId = adminUser ? adminUser.id : 1;

    // 2. Seed 20 Departments
    const departmentsData = [
      { name: 'Signaling & Telecommunication (S&T)' },
      { name: 'Electrical (General)' },
      { name: 'Traction Distribution (TRD)' },
      { name: 'Civil Engineering' },
      { name: 'Mechanical (Carriage & Wagon)' },
      { name: 'Operating (Traffic)' },
      { name: 'Commercial' },
      { name: 'Security (RPF)' },
      { name: 'Safety' },
      { name: 'Accounts & Finance' },
      { name: 'Personnel (HR)' },
      { name: 'Medical' }
    ];
    const departments = await Department.bulkCreate(departmentsData);
    
    // 3. Seed Vendors
    const vendorsData = [
      { name: 'Siemens Mobility India', vendorCode: 'SIEM-001', contactPerson: 'Mr. Anil Kumar', email: 'rail.sales@siemens.com', phone: '+91 98765 00010', address: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400051', gstin: '27AAAAA0010A1Z1', website: 'https://siemens.com', avgRating: '4.80', totalRatings: 10, isActive: true },
      { name: 'Alstom Transport India', vendorCode: 'ALST-002', contactPerson: 'Ms. Priya Sen', email: 'sales.india@alstom.com', phone: '+91 98765 00011', address: 'Tech Park, Whitefield', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560066', gstin: '29AAAAA0011A1Z2', website: 'https://alstom.com', avgRating: '4.70', totalRatings: 8, isActive: true },
      { name: 'Trimble Navigation Ltd', vendorCode: 'TRIM-003', contactPerson: 'Mr. John Doe', email: 'gedo.sales@trimble.com', phone: '+91 98765 00012', address: 'Global Tech Park', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110001', gstin: '07AAAAA0012A1Z3', website: 'https://trimble.com', avgRating: '4.95', totalRatings: 12, isActive: true },
      { name: 'Honeywell Security Solutions', vendorCode: 'HNYW-004', contactPerson: 'Mr. Rakesh Roy', email: 'cctv.sales@honeywell.com', phone: '+91 98765 00013', address: 'Sector 48', city: 'Gurugram', state: 'Haryana', country: 'India', pincode: '122018', gstin: '06AAAAA0013A1Z4', website: 'https://honeywell.com', avgRating: '4.50', totalRatings: 6, isActive: true },
      { name: 'Schneider Electric India', vendorCode: 'SCHN-005', contactPerson: 'Ms. Neha Patel', email: 'ups.sales@schneider.com', phone: '+91 98765 00014', address: 'Industrial Area', city: 'Noida', state: 'Uttar Pradesh', country: 'India', pincode: '201301', gstin: '09AAAAA0014A1Z5', website: 'https://se.com', avgRating: '4.60', totalRatings: 9, isActive: true }
    ];
    const vendors = await Vendor.bulkCreate(vendorsData);

    // 4. Seed Employees
    const employeesData = [
      { firstName: 'Rajesh', lastName: 'Sharma', email: 'rajesh.sharma@company.com', phone: '+91 99887 00010', departmentId: departments[0].id, designation: 'Senior Signal Engineer', employeeCode: 'EMP-1001', joinDate: new Date() },
      { firstName: 'Suresh', lastName: 'Verma', email: 'suresh.verma@company.com', phone: '+91 99887 00011', departmentId: departments[5].id, designation: 'Station Master', employeeCode: 'EMP-1002', joinDate: new Date() },
      { firstName: 'Amit', lastName: 'Kumar', email: 'amit.kumar@company.com', phone: '+91 99887 00012', departmentId: departments[1].id, designation: 'Electrical Maintainer', employeeCode: 'EMP-1003', joinDate: new Date() },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@company.com', phone: '+91 99887 00013', departmentId: departments[8].id, designation: 'Safety Officer', employeeCode: 'EMP-1004', joinDate: new Date() }
    ];
    const employees = await Employee.bulkCreate(employeesData);

    // 5. Seed Asset Categories
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
      { name: 'Generators' }
    ];
    const categories = await AssetCategory.bulkCreate(categoriesData);

    // 6. Seed Assets
    const assetsData = [
      { name: 'Siemens Westrace II Signal Controller', assetTag: 'AST-2026-000001', assetUniqueId: 'AST-2026-000001', categoryId: categories[0].id, brand: 'Siemens', model: 'Westrace II', serialNumber: 'SN-SIEM-99881', purchaseDate: '2024-01-15', purchaseCost: 650000, currentValue: 550000, location: 'Bhubaneswar West Relay Room', warrantyExpiry: '2027-01-15', status: 'ASSIGNED', assignedToId: employees[0].id, imageUrl: 'uploads/assets/routers.png', qrCodeUrl: '/uploads/qr/AST-2026-000001.png', createdById: adminId },
      { name: 'Alstom S700K Point Machine', assetTag: 'AST-2026-000002', assetUniqueId: 'AST-2026-000002', categoryId: categories[1].id, brand: 'Alstom', model: 'S700K', serialNumber: 'SN-ALST-55662', purchaseDate: '2024-03-10', purchaseCost: 120000, currentValue: 90000, location: 'Cuttack Yard Point 4A', warrantyExpiry: '2026-03-10', status: 'AVAILABLE', imageUrl: 'uploads/assets/vehicles.png', qrCodeUrl: '/uploads/qr/AST-2026-000002.png', createdById: adminId },
      { name: 'HP ProLiant Railway Command Server', assetTag: 'AST-2026-000003', assetUniqueId: 'AST-2026-000003', categoryId: categories[2].id, brand: 'HP', model: 'ProLiant DL380', serialNumber: 'SN-HPE-88443', purchaseDate: '2023-06-20', purchaseCost: 350000, currentValue: 280000, location: 'Puri Zonal Data Center', warrantyExpiry: '2026-06-20', status: 'ASSIGNED', assignedToId: employees[1].id, imageUrl: 'uploads/assets/servers.png', qrCodeUrl: '/uploads/qr/AST-2026-000003.png', createdById: adminId },
      { name: 'Trimble GEDO CE (Track Inspection Device)', assetTag: 'AST-2026-000004', assetUniqueId: 'AST-2026-000004', categoryId: categories[3].id, brand: 'Trimble', model: 'GEDO CE', serialNumber: 'SN-TRIM-11224', purchaseDate: '2025-01-10', purchaseCost: 850000, currentValue: 800000, location: 'Khurda Road Depot', warrantyExpiry: '2028-01-10', status: 'UNDER_REPAIR', imageUrl: 'uploads/assets/projectors.png', qrCodeUrl: '/uploads/qr/AST-2026-000004.png', createdById: adminId },
      { name: 'APC Smart-UPS 5kVA (UPS System)', assetTag: 'AST-2026-000005', assetUniqueId: 'AST-2026-000005', categoryId: categories[4].id, brand: 'APC', model: 'Smart-UPS 5kVA', serialNumber: 'SN-APCC-44555', purchaseDate: '2023-08-05', purchaseCost: 95000, currentValue: 65000, location: 'Cuttack Yard Relay Room', warrantyExpiry: '2025-08-05', status: 'ASSIGNED', assignedToId: employees[2].id, imageUrl: 'uploads/assets/ups_systems.png', qrCodeUrl: '/uploads/qr/AST-2026-000005.png', createdById: adminId },
      { name: 'Honeywell IP-Bullet 5MP (Railway CCTV)', assetTag: 'AST-2026-000009', assetUniqueId: 'AST-2026-000009', categoryId: categories[8].id, brand: 'Honeywell', model: 'IP-Bullet 5MP', serialNumber: 'SN-HNYW-54522', purchaseDate: '2025-05-12', purchaseCost: 12000, currentValue: 10000, location: 'Bhubaneswar Platform 1', warrantyExpiry: '2027-05-12', status: 'ASSIGNED', assignedToId: employees[3].id, imageUrl: 'uploads/assets/cctv_cameras.png', qrCodeUrl: '/uploads/qr/AST-2026-000009.png', createdById: adminId }
    ];
    const assets = await Asset.bulkCreate(assetsData);

    // 7. Seed Maintenance Records
    const maintenanceData = [
      { assetId: assets[3].id, maintenanceType: 'PREVENTIVE', description: 'Laser sensor calibration & optical cleaning', cost: 12000, status: 'IN_PROGRESS', startDate: '2026-06-25', technician: 'S. K. Mohanty', notes: 'Scheduled inspection' },
      { assetId: assets[0].id, maintenanceType: 'CORRECTIVE', description: 'Realignment of Relay contacts & firmware patch', cost: 18000, status: 'COMPLETED', startDate: '2026-05-10', endDate: '2026-05-12', technician: 'Amit Kumar', notes: 'Signal lag resolved' }
    ];
    await MaintenanceRequest.bulkCreate(maintenanceData);

    // 8. Seed Warranty Tracking
    const warrantyData = [
      { assetId: assets[0].id, providerName: 'Siemens Mobility', contractNumber: 'WNT-SIEM-2024-01', startDate: '2024-01-15', expiryDate: '2027-01-15', terms: 'Full onsite hardware swap & software support' },
      { assetId: assets[1].id, providerName: 'Alstom Transport', contractNumber: 'WNT-ALST-2024-02', startDate: '2024-03-10', expiryDate: '2026-03-10', terms: 'Mechanical components coverage & oil checkups' }
    ];
    await WarrantyTracking.bulkCreate(warrantyData);

    // 9. Seed Audit Logs
    const auditData = [
      { assetId: assets[0].id, action: 'ALLOCATE', details: 'Siemens Westrace controller allocated to Rajesh Sharma.', performedById: adminId, ipAddress: '127.0.0.1' },
      { assetId: assets[3].id, action: 'MAINTENANCE', details: 'Trimble GEDO sent to workshop queue.', performedById: adminId, ipAddress: '127.0.0.1' }
    ];
    await AuditLog.bulkCreate(auditData);

    // 10. Seed Movements
    const movementData = [
      { assetId: assets[0].id, sourceLocation: 'Bhubaneswar Central Store', destinationLocation: 'Bhubaneswar West Relay Room', movementDate: '2024-01-16', status: 'COMPLETED', receivedById: employees[0].id }
    ];
    await AssetMovement.bulkCreate(movementData);

    // 11. Seed Notifications
    const notificationsData = [
      { userId: adminId, title: 'Critical Health Warning', message: 'Alstom S700K Point machine health score degraded below 40%.', type: 'MAINTENANCE_COMPLETE', isRead: false },
      { userId: adminId, title: 'Warranty Renewal Needed', message: 'Alstom Point Machine warranty expired on 2026-03-10.', type: 'WARRANTY_EXPIRING', isRead: false }
    ];
    await Notification.bulkCreate(notificationsData);

    logger.info('🎉 Purge & Reseed of ECoR Divisional Demo Database completed successfully!');
    
    // Recalculate health scores
    try {
      const assetHealthService = require('../services/assetHealthService');
      await assetHealthService.recalculateAll();
      logger.info('✅ Health scores recalculated successfully');
    } catch (err) {
      logger.warn('⚠️ Could not run health score recalculation: ' + err.message);
    }
    
    return true;
  } catch (error) {
    logger.error(`❌ Purge & Reseed database failed: ${error.message}`);
    throw error;
  }
}

module.exports = { seedEnterpriseData, resetAndSeedDatabase };
