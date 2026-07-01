export const isNetworkError = (error) => !error.response

export const mockResponse = (data) => Promise.resolve({ data: { data } })

export const fallbackOnNetworkError = (request, data) =>
  request.catch((error) => {
    if (isNetworkError(error) || error.response?.status === 404) return mockResponse(data)
    throw error
  })

export const demoAuth = {
  userId: 1,
  email: 'admin@company.com',
  firstName: 'Demo',
  lastName: 'Admin',
  roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
  department: 'IT',
}

export const demoDashboard = {
  totalAssets: 248,
  availableAssets: 82,
  assignedAssets: 139,
  underRepair: 14,
  warrantyExpiringIn30Days: 11,
  totalEmployees: 96,
  openMaintenanceRequests: 18,
  highRiskAssets: 9,
  totalPurchaseValue: 18450000,
  totalCurrentValue: 12640000,
  totalDepreciation: 5810000,
}

// ── 25 Assets ────────────────────────────────────────────────────────────────
export const demoAssets = [
  { id: 1, assetTag: 'AST-10001', name: 'Dell Latitude 5420', brand: 'Dell', model: 'Latitude 5420', serialNumber: 'SN-DEL9876', categoryName: 'Laptops', status: 'ASSIGNED', departmentName: 'Information Technology', assignedToName: 'Rajesh Sharma', purchaseCost: 85000, purchaseDate: '2025-01-15', warrantyExpiry: '2028-01-15', location: 'Floor 2, Desk 42' },
  { id: 2, assetTag: 'AST-10002', name: 'HP EliteBook 840', brand: 'HP', model: 'EliteBook 840', serialNumber: 'SN-HP8831', categoryName: 'Laptops', status: 'AVAILABLE', departmentName: 'Human Resources', assignedToName: null, purchaseCost: 92000, purchaseDate: '2025-02-10', warrantyExpiry: '2028-02-10', location: 'IT Store Room' },
  { id: 3, assetTag: 'AST-10003', name: 'Apple MacBook Pro 14', brand: 'Apple', model: 'MacBook Pro 14', serialNumber: 'SN-APL5541', categoryName: 'Laptops', status: 'ASSIGNED', departmentName: 'Product Management', assignedToName: 'Neha Patel', purchaseCost: 185000, purchaseDate: '2025-03-01', warrantyExpiry: '2026-03-01', location: 'Remote Working' },
  { id: 4, assetTag: 'AST-10004', name: 'Lenovo ThinkPad T14', brand: 'Lenovo', model: 'ThinkPad T14', serialNumber: 'SN-LEN2291', categoryName: 'Laptops', status: 'UNDER_REPAIR', departmentName: 'Sales & Marketing', assignedToName: null, purchaseCost: 78000, purchaseDate: '2024-11-20', warrantyExpiry: '2027-11-20', location: 'Floor 1, Cabinet A' },
  { id: 5, assetTag: 'AST-10005', name: 'Dell OptiPlex 7090', brand: 'Dell', model: 'OptiPlex 7090', serialNumber: 'SN-DEL1102', categoryName: 'Desktops', status: 'ASSIGNED', departmentName: 'Finance & Accounts', assignedToName: 'Amit Kumar', purchaseCost: 65000, purchaseDate: '2024-05-15', warrantyExpiry: '2027-05-15', location: 'Floor 3, Desk 12' },
  { id: 6, assetTag: 'AST-10006', name: 'HP LaserJet Pro M404dn', brand: 'HP', model: 'LaserJet M404dn', serialNumber: 'SN-HP3382', categoryName: 'Printers', status: 'AVAILABLE', departmentName: 'Administration & Facilities', assignedToName: null, purchaseCost: 28000, purchaseDate: '2024-06-18', warrantyExpiry: '2025-06-18', location: 'Floor 2, Common Area' },
  { id: 7, assetTag: 'AST-10007', name: 'Canon imageRUNNER 2206', brand: 'Canon', model: 'imageRUNNER 2206', serialNumber: 'SN-CAN9921', categoryName: 'Printers', status: 'ASSIGNED', departmentName: 'Legal & Compliance', assignedToName: 'Pooja Singh', purchaseCost: 45000, purchaseDate: '2024-07-22', warrantyExpiry: '2026-07-22', location: 'Floor 4, Records Room' },
  { id: 8, assetTag: 'AST-10008', name: 'Dell PowerEdge R750', brand: 'Dell', model: 'PowerEdge R750', serialNumber: 'SN-DEL0082', categoryName: 'Servers', status: 'ASSIGNED', departmentName: 'Information Technology', assignedToName: 'Sanjay Das', purchaseCost: 260000, purchaseDate: '2025-01-10', warrantyExpiry: '2030-01-10', location: 'Server Room A, Rack 3' },
  { id: 9, assetTag: 'AST-10009', name: 'Cisco ISR 4331 Router', brand: 'Cisco', model: 'ISR 4331', serialNumber: 'SN-CIS4481', categoryName: 'Routers', status: 'ASSIGNED', departmentName: 'Information Technology', assignedToName: 'Rahul Pandey', purchaseCost: 48000, purchaseDate: '2024-09-05', warrantyExpiry: '2027-09-05', location: 'Network Rack Floor 2' },
  { id: 10, assetTag: 'AST-10010', name: 'Aruba CX 6100 Switch', brand: 'Aruba', model: 'CX 6100', serialNumber: 'SN-ARU5501', categoryName: 'Switches', status: 'AVAILABLE', departmentName: 'Information Technology', assignedToName: null, purchaseCost: 62000, purchaseDate: '2024-10-12', warrantyExpiry: '2027-10-12', location: 'Network Rack Floor 1' },
  { id: 11, assetTag: 'AST-10011', name: 'Epson EB-E01 Projector', brand: 'Epson', model: 'EB-E01', serialNumber: 'SN-EPS7761', categoryName: 'Projectors', status: 'AVAILABLE', departmentName: 'Corporate Communications', assignedToName: null, purchaseCost: 35000, purchaseDate: '2024-12-05', warrantyExpiry: '2025-12-05', location: 'Conference Room 3B' },
  { id: 12, assetTag: 'AST-10012', name: 'Voltas Vectra 1.5T AC', brand: 'Voltas', model: 'Vectra 1.5T', serialNumber: 'SN-VOL8841', categoryName: 'Air Conditioners', status: 'ASSIGNED', departmentName: 'Administration & Facilities', assignedToName: 'Sunil Nair', purchaseCost: 40000, purchaseDate: '2023-04-10', warrantyExpiry: '2026-04-10', location: 'HR Server Room' },
  { id: 13, assetTag: 'AST-10013', name: 'Steelcase Ergonomic Chair', brand: 'Steelcase', model: 'Gesture', serialNumber: 'SN-STC1122', categoryName: 'Furniture', status: 'ASSIGNED', departmentName: 'R&D', assignedToName: 'Meera Mishra', purchaseCost: 16000, purchaseDate: '2024-08-14', warrantyExpiry: '2029-08-14', location: 'Floor 3, Desk 89' },
  { id: 14, assetTag: 'AST-10014', name: 'Tata Tigor EV', brand: 'Tata', model: 'Tigor EV', serialNumber: 'SN-TAT0091', categoryName: 'Vehicles', status: 'ASSIGNED', departmentName: 'Operations & Logistics', assignedToName: 'Vijay Choudhury', purchaseCost: 980000, purchaseDate: '2024-02-18', warrantyExpiry: '2027-02-18', location: 'Parking Slot 12' },
  { id: 15, assetTag: 'AST-10015', name: 'Microsoft Office 365 Pro', brand: 'Microsoft', model: 'O365 Enterprise', serialNumber: 'SN-MS-998', categoryName: 'Software Licenses', status: 'ASSIGNED', departmentName: 'Customer Support', assignedToName: 'Richa Sawant', purchaseCost: 12000, purchaseDate: '2025-05-01', warrantyExpiry: '2026-05-01', location: 'Cloud Deployment' },
  { id: 16, assetTag: 'AST-10016', name: 'HP EliteDesk 800', brand: 'HP', model: 'EliteDesk 800', serialNumber: 'SN-HP5511', categoryName: 'Desktops', status: 'AVAILABLE', departmentName: 'Customer Support', assignedToName: null, purchaseCost: 58000, purchaseDate: '2024-11-15', warrantyExpiry: '2027-11-15', location: 'Support Lab Bench 4' },
  { id: 17, assetTag: 'AST-10017', name: 'Sony VPL-DX221 Projector', brand: 'Sony', model: 'VPL-DX221', serialNumber: 'SN-SON1129', categoryName: 'Projectors', status: 'ASSIGNED', departmentName: 'Sales & Marketing', assignedToName: 'Rohan Gupta', purchaseCost: 38000, purchaseDate: '2024-03-24', warrantyExpiry: '2025-03-24', location: 'Floor 1, Meeting Room B' },
  { id: 18, assetTag: 'AST-10018', name: 'Godrej Interio L-Desk', brand: 'Godrej', model: 'L-Desk Pro', serialNumber: 'SN-GOD0044', categoryName: 'Furniture', status: 'ASSIGNED', departmentName: 'Finance & Accounts', assignedToName: 'Jyoti Rao', purchaseCost: 14000, purchaseDate: '2023-11-02', warrantyExpiry: '2026-11-02', location: 'Floor 3, Accounts Bay' },
  { id: 19, assetTag: 'AST-10019', name: 'Cisco Catalyst 9300', brand: 'Cisco', model: 'Catalyst 9300', serialNumber: 'SN-CIS0092', categoryName: 'Switches', status: 'UNDER_REPAIR', departmentName: 'Information Technology', assignedToName: null, purchaseCost: 72000, purchaseDate: '2024-05-20', warrantyExpiry: '2027-05-20', location: 'Main IT Lab' },
  { id: 20, assetTag: 'AST-10020', name: 'Apple MacBook Air M2', brand: 'Apple', model: 'MacBook Air M2', serialNumber: 'SN-APL0099', categoryName: 'Laptops', status: 'ASSIGNED', departmentName: 'Design & Creative', assignedToName: 'Preeti Iyer', purchaseCost: 115000, purchaseDate: '2025-04-18', warrantyExpiry: '2026-04-18', location: 'Remote Working' },
  { id: 21, assetTag: 'AST-10021', name: 'Dell Latitude 3420', brand: 'Dell', model: 'Latitude 3420', serialNumber: 'SN-DEL2239', categoryName: 'Laptops', status: 'AVAILABLE', departmentName: 'Information Technology', assignedToName: null, purchaseCost: 65000, purchaseDate: '2025-05-22', warrantyExpiry: '2028-05-22', location: 'IT Buffer stock' },
  { id: 22, assetTag: 'AST-10022', name: 'HP LaserJet Enterprise', brand: 'HP', model: 'M507dn', serialNumber: 'SN-HP9922', categoryName: 'Printers', status: 'ASSIGNED', departmentName: 'Operations & Logistics', assignedToName: 'Harish Sandhu', purchaseCost: 39000, purchaseDate: '2024-08-20', warrantyExpiry: '2025-08-20', location: 'Dispatch Office Floor 1' },
  { id: 23, assetTag: 'AST-10023', name: 'Blue Star 1.5T AC', brand: 'Blue Star', model: 'Inverter 1.5T', serialNumber: 'SN-BLU0019', categoryName: 'Air Conditioners', status: 'ASSIGNED', departmentName: 'Administration & Facilities', assignedToName: 'Simran Kapoor', purchaseCost: 44000, purchaseDate: '2023-06-15', warrantyExpiry: '2026-06-15', location: 'Floor 2, Pantry' },
  { id: 24, assetTag: 'AST-10024', name: 'Godrej Ergonomic Chair', brand: 'Godrej', model: 'Aero', serialNumber: 'SN-GOD7721', categoryName: 'Furniture', status: 'AVAILABLE', departmentName: 'Administration & Facilities', assignedToName: null, purchaseCost: 11000, purchaseDate: '2024-09-10', warrantyExpiry: '2027-09-10', location: 'Facilities Buffer Stock' },
  { id: 25, assetTag: 'AST-10025', name: 'Adobe Creative Cloud', brand: 'Adobe', model: 'Creative Cloud Suite', serialNumber: 'SN-AD-773', categoryName: 'Software Licenses', status: 'ASSIGNED', departmentName: 'Design & Creative', assignedToName: 'Ayush Sethi', purchaseCost: 45000, purchaseDate: '2025-01-20', warrantyExpiry: '2026-01-20', location: 'Cloud Deployment' }
]

export const demoAssetPage = {
  content: demoAssets,
  totalElements: demoAssets.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

// ── 25 Employees ─────────────────────────────────────────────────────────────
export const demoEmployees = [
  { id: 1, employeeCode: 'EMP-1001', firstName: 'Rajesh', lastName: 'Sharma', email: 'rajesh.sharma@company.com', phone: '+91 99887 00010', departmentName: 'Information Technology', designation: 'Technical Lead', joiningDate: '2020-02-15' },
  { id: 2, employeeCode: 'EMP-1002', firstName: 'Suresh', lastName: 'Verma', email: 'suresh.verma@company.com', phone: '+91 99887 00011', departmentName: 'Human Resources', designation: 'HR Executive', joiningDate: '2021-03-10' },
  { id: 3, employeeCode: 'EMP-1003', firstName: 'Amit', lastName: 'Kumar', email: 'amit.kumar@company.com', phone: '+91 99887 00012', departmentName: 'Finance & Accounts', designation: 'Finance Manager', joiningDate: '2019-11-20' },
  { id: 4, employeeCode: 'EMP-1004', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@company.com', phone: '+91 99887 00013', departmentName: 'Sales & Marketing', designation: 'Marketing Executive', joiningDate: '2022-01-14' },
  { id: 5, employeeCode: 'EMP-1005', firstName: 'Neha', lastName: 'Singh', email: 'neha.singh@company.com', phone: '+91 99887 00014', departmentName: 'Product Management', designation: 'Product Manager', joiningDate: '2020-08-25' },
  { id: 6, employeeCode: 'EMP-1006', firstName: 'Rohan', lastName: 'Gupta', email: 'rohan.gupta@company.com', phone: '+91 99887 00015', departmentName: 'Sales & Marketing', designation: 'Sales Director', joiningDate: '2018-05-18' },
  { id: 7, employeeCode: 'EMP-1007', firstName: 'Vikram', lastName: 'Joshi', email: 'vikram.joshi@company.com', phone: '+91 99887 00016', departmentName: 'Legal & Compliance', designation: 'Legal Counsel', joiningDate: '2021-09-02' },
  { id: 8, employeeCode: 'EMP-1008', firstName: 'Anjali', lastName: 'Mehta', email: 'anjali.mehta@company.com', phone: '+91 99887 00017', departmentName: 'Customer Support', designation: 'Support Lead', joiningDate: '2020-10-15' },
  { id: 9, employeeCode: 'EMP-1009', firstName: 'Deepak', lastName: 'Reddy', email: 'deepak.reddy@company.com', phone: '+91 99887 00018', departmentName: 'R&D', designation: 'QA Specialist', joiningDate: '2021-05-12' },
  { id: 10, employeeCode: 'EMP-1010', firstName: 'Jyoti', lastName: 'Rao', email: 'jyoti.rao@company.com', phone: '+91 99887 00019', departmentName: 'Finance & Accounts', designation: 'Financial Analyst', joiningDate: '2022-04-18' },
  { id: 11, employeeCode: 'EMP-1011', firstName: 'Sunil', lastName: 'Nair', email: 'sunil.nair@company.com', phone: '+91 99887 00020', departmentName: 'Administration & Facilities', designation: 'Facilities Executive', joiningDate: '2020-07-11' },
  { id: 12, employeeCode: 'EMP-1012', firstName: 'Karan', lastName: 'Mishra', email: 'karan.mishra@company.com', phone: '+91 99887 00021', departmentName: 'Operations & Logistics', designation: 'Operations Manager', joiningDate: '2019-12-05' },
  { id: 13, employeeCode: 'EMP-1013', firstName: 'Meera', lastName: 'Mishra', email: 'meera.mishra@company.com', phone: '+91 99887 00022', departmentName: 'R&D', designation: 'Senior Engineer', joiningDate: '2021-02-14' },
  { id: 14, employeeCode: 'EMP-1014', firstName: 'Ritu', lastName: 'Choudhury', email: 'ritu.choudhury@company.com', phone: '+91 99887 00023', departmentName: 'Corporate Communications', designation: 'PR Manager', joiningDate: '2022-09-08' },
  { id: 15, employeeCode: 'EMP-1015', firstName: 'Vijay', lastName: 'Choudhury', email: 'vijay.choudhury@company.com', phone: '+91 99887 00024', departmentName: 'Operations & Logistics', designation: 'Logistics Lead', joiningDate: '2020-11-20' },
  { id: 16, employeeCode: 'EMP-1016', firstName: 'Rahul', lastName: 'Pandey', email: 'rahul.pandey@company.com', phone: '+91 99887 00025', departmentName: 'Information Technology', designation: 'Network Engineer', joiningDate: '2021-08-14' },
  { id: 17, employeeCode: 'EMP-1017', firstName: 'Pooja', lastName: 'Saxena', email: 'pooja.saxena@company.com', phone: '+91 99887 00026', departmentName: 'Legal & Compliance', designation: 'Compliance Officer', joiningDate: '2020-04-18' },
  { id: 18, employeeCode: 'EMP-1018', firstName: 'Sanjay', lastName: 'Das', email: 'sanjay.das@company.com', phone: '+91 99887 00027', departmentName: 'Information Technology', designation: 'Database Administrator', joiningDate: '2021-01-10' },
  { id: 19, employeeCode: 'EMP-1019', firstName: 'Arun', lastName: 'Sen', email: 'arun.sen@company.com', phone: '+91 99887 00028', departmentName: 'Customer Support', designation: 'Support Engineer', joiningDate: '2022-03-24' },
  { id: 20, employeeCode: 'EMP-1020', firstName: 'Kiran', lastName: 'Roy', email: 'kiran.roy@company.com', phone: '+91 99887 00029', departmentName: 'Security & Safety', designation: 'Security Lead', joiningDate: '2021-12-05' },
  { id: 21, employeeCode: 'EMP-1021', firstName: 'Preeti', lastName: 'Iyer', email: 'preeti.iyer@company.com', phone: '+91 99887 00030', departmentName: 'Design & Creative', designation: 'Lead UI/UX Designer', joiningDate: '2022-05-12' },
  { id: 22, employeeCode: 'EMP-1022', firstName: 'Harish', lastName: 'Sandhu', email: 'harish.sandhu@company.com', phone: '+91 99887 00031', departmentName: 'Operations & Logistics', designation: 'Logistics Coordinator', joiningDate: '2021-08-20' },
  { id: 23, employeeCode: 'EMP-1023', firstName: 'Simran', lastName: 'Kapoor', email: 'simran.kapoor@company.com', phone: '+91 99887 00032', departmentName: 'Administration & Facilities', designation: 'Office Coordinator', joiningDate: '2020-06-15' },
  { id: 24, employeeCode: 'EMP-1024', firstName: 'Ayush', lastName: 'Sethi', email: 'ayush.sethi@company.com', phone: '+91 99887 00033', departmentName: 'Design & Creative', designation: 'Graphic Designer', joiningDate: '2022-01-20' },
  { id: 25, employeeCode: 'EMP-1025', firstName: 'Richa', lastName: 'Sawant', email: 'richa.sawant@company.com', phone: '+91 99887 00034', departmentName: 'Customer Support', designation: 'Support Specialist', joiningDate: '2021-06-25' }
]

export const demoEmployeePage = {
  content: demoEmployees,
  totalElements: demoEmployees.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

// ── 25 Allocations ───────────────────────────────────────────────────────────
export const demoAllocations = [
  { id: 1, assetId: 1, assetName: 'Dell Latitude 5420', assetTag: 'AST-10001', employeeId: 1, employeeName: 'Rajesh Sharma', allocatedDate: '2025-01-20', expectedReturn: '2028-01-20', status: 'ACTIVE', purpose: 'Developer workstation setup', notes: 'Given in original box with charger.' },
  { id: 2, assetId: 3, assetName: 'Apple MacBook Pro 14', assetTag: 'AST-10003', employeeId: 5, employeeName: 'Neha Patel', allocatedDate: '2025-03-05', expectedReturn: '2026-03-05', status: 'ACTIVE', purpose: 'Product management operations', notes: 'MacBook bundle.' },
  { id: 3, assetId: 5, assetName: 'Dell OptiPlex 7090', assetTag: 'AST-10005', employeeId: 3, employeeName: 'Amit Kumar', allocatedDate: '2024-05-20', expectedReturn: '2027-05-20', status: 'ACTIVE', purpose: 'Accounting station', notes: 'Includes dual monitor setup.' },
  { id: 4, assetId: 7, assetName: 'Canon imageRUNNER 2206', assetTag: 'AST-10007', employeeId: 17, employeeName: 'Pooja Saxena', allocatedDate: '2024-07-25', expectedReturn: '2026-07-25', status: 'ACTIVE', purpose: 'Legal and administrative printing', notes: 'Configured on network.' },
  { id: 5, assetId: 8, assetName: 'Dell PowerEdge R750', assetTag: 'AST-10008', employeeId: 18, employeeName: 'Sanjay Das', allocatedDate: '2025-01-15', expectedReturn: '2030-01-15', status: 'ACTIVE', purpose: 'Production database hosting', notes: 'Monitored 24/7.' },
  { id: 6, assetId: 9, assetName: 'Cisco ISR 4331 Router', assetTag: 'AST-10009', employeeId: 16, employeeName: 'Rahul Pandey', allocatedDate: '2024-09-10', expectedReturn: '2027-09-10', status: 'ACTIVE', purpose: 'Core gateway configuration', notes: 'Installed in rack.' },
  { id: 7, assetId: 12, assetName: 'Voltas Vectra 1.5T AC', assetTag: 'AST-10012', employeeId: 11, employeeName: 'Sunil Nair', allocatedDate: '2023-04-12', expectedReturn: '2026-04-12', status: 'ACTIVE', purpose: 'Cooling at server annex', notes: 'Requires quarterly filter cleanup.' },
  { id: 8, assetId: 13, assetName: 'Steelcase Ergonomic Chair', assetTag: 'AST-10013', employeeId: 13, employeeName: 'Meera Mishra', allocatedDate: '2024-08-16', expectedReturn: '2029-08-16', status: 'ACTIVE', purpose: 'Ergonomic seat deployment', notes: 'Adjusted armrests.' },
  { id: 9, assetId: 14, assetName: 'Tata Tigor EV', assetTag: 'AST-10014', employeeId: 15, employeeName: 'Vijay Choudhury', allocatedDate: '2024-02-20', expectedReturn: '2027-02-20', status: 'ACTIVE', purpose: 'Corporate dispatch deliveries', notes: 'Vehicle logs updated.' },
  { id: 10, assetId: 15, assetName: 'Microsoft Office 365 Pro', assetTag: 'AST-10015', employeeId: 25, employeeName: 'Richa Sawant', allocatedDate: '2025-05-02', expectedReturn: '2026-05-02', status: 'ACTIVE', purpose: 'Support team coordination', notes: 'Active subscription.' },
  { id: 11, assetId: 17, assetName: 'Sony VPL-DX221 Projector', assetTag: 'AST-10017', employeeId: 6, employeeName: 'Rohan Gupta', allocatedDate: '2024-03-28', expectedReturn: '2025-03-28', status: 'ACTIVE', purpose: 'Sales client pitches', notes: 'Includes carrying case.' },
  { id: 12, assetId: 18, assetName: 'Godrej Interio L-Desk', assetTag: 'AST-10018', employeeId: 10, employeeName: 'Jyoti Rao', allocatedDate: '2023-11-05', expectedReturn: '2026-11-05', status: 'ACTIVE', purpose: 'Audit team desk setup', notes: 'Fixed on Floor 3.' },
  { id: 13, assetId: 20, assetName: 'Apple MacBook Air M2', assetTag: 'AST-10020', employeeId: 21, employeeName: 'Preeti Iyer', allocatedDate: '2025-04-20', expectedReturn: '2026-04-20', status: 'ACTIVE', purpose: 'Creative design software access', notes: 'Equipped with digital pen.' },
  { id: 14, assetId: 22, assetName: 'HP LaserJet Enterprise', assetTag: 'AST-10022', employeeId: 22, employeeName: 'Harish Sandhu', allocatedDate: '2024-08-22', expectedReturn: '2025-08-22', status: 'ACTIVE', purpose: 'Logistics slip printing', notes: 'Connected to desk system.' },
  { id: 15, assetId: 23, assetName: 'Blue Star 1.5T AC', assetTag: 'AST-10023', employeeId: 23, employeeName: 'Simran Kapoor', allocatedDate: '2023-06-18', expectedReturn: '2026-06-18', status: 'ACTIVE', purpose: 'Pantry unit maintenance', notes: 'Standard settings.' },
  { id: 16, assetId: 25, assetName: 'Adobe Creative Cloud', assetTag: 'AST-10025', employeeId: 24, employeeName: 'Ayush Sethi', allocatedDate: '2025-01-22', expectedReturn: '2026-01-22', status: 'ACTIVE', purpose: 'Graphic vector design work', notes: 'Subscription renewed.' },
  { id: 17, assetId: 2, assetName: 'HP EliteBook 840', assetTag: 'AST-10002', employeeId: 2, employeeName: 'Suresh Verma', allocatedDate: '2024-02-15', expectedReturn: '2024-12-15', status: 'RETURNED', purpose: 'HR on-boarding setup', notes: 'Returned in good condition.' },
  { id: 18, assetId: 4, assetName: 'Lenovo ThinkPad T14', assetTag: 'AST-10004', employeeId: 4, employeeName: 'Priya Patel', allocatedDate: '2023-11-25', expectedReturn: '2024-11-25', status: 'RETURNED', purpose: 'Marketing roadshows', notes: 'Returned with minor scratches.' },
  { id: 19, assetId: 6, assetName: 'HP LaserJet Pro M404dn', assetTag: 'AST-10006', employeeId: 11, employeeName: 'Sunil Nair', allocatedDate: '2024-01-10', expectedReturn: '2024-06-10', status: 'RETURNED', purpose: 'Buffer area setup', notes: 'Cleaned and returned.' },
  { id: 20, assetId: 10, assetName: 'Aruba CX 6100 Switch', assetTag: 'AST-10010', employeeId: 16, employeeName: 'Rahul Pandey', allocatedDate: '2024-02-05', expectedReturn: '2024-08-05', status: 'RETURNED', purpose: 'Network lab trials', notes: 'Returned to IT storage.' },
  { id: 21, assetId: 11, assetName: 'Epson EB-E01 Projector', assetTag: 'AST-10011', employeeId: 14, employeeName: 'Ritu Choudhury', allocatedDate: '2024-05-15', expectedReturn: '2024-09-15', status: 'RETURNED', purpose: 'Public relations seminar', notes: 'Working properly.' },
  { id: 22, assetId: 16, assetName: 'HP EliteDesk 800', assetTag: 'AST-10016', employeeId: 19, employeeName: 'Arun Sen', allocatedDate: '2024-01-20', expectedReturn: '2024-07-20', status: 'RETURNED', purpose: 'Support backup workstation', notes: 'Formatted and returned.' },
  { id: 23, assetId: 21, assetName: 'Dell Latitude 3420', assetTag: 'AST-10021', employeeId: 1, employeeName: 'Rajesh Sharma', allocatedDate: '2024-03-15', expectedReturn: '2024-09-15', status: 'RETURNED', purpose: 'Short project duty', notes: 'Returned safely.' },
  { id: 24, assetId: 24, assetName: 'Godrej Ergonomic Chair', assetTag: 'AST-10024', employeeId: 23, employeeName: 'Simran Kapoor', allocatedDate: '2023-09-12', expectedReturn: '2024-03-12', status: 'RETURNED', purpose: 'Temporary floor desk', notes: 'Returned to store.' },
  { id: 25, assetId: 19, assetName: 'Cisco Catalyst 9300', assetTag: 'AST-10019', employeeId: 16, employeeName: 'Rahul Pandey', allocatedDate: '2023-06-20', expectedReturn: '2023-12-20', status: 'RETURNED', purpose: 'Router lab upgrade tests', notes: 'Uninstalled and returned.' }
]

export const demoAllocationPage = {
  content: demoAllocations,
  totalElements: demoAllocations.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

// ── 25 Vendors ───────────────────────────────────────────────────────────────
export const demoVendors = [
  { id: 1, vendorCode: 'VEN-DEL-101', name: 'Dell India Tech', contactPerson: 'Rajesh Kumar', email: 'sales@dell.co.in', phone: '+91 99999 88881', address: 'Commercial Block A, Sector 62', city: 'Noida', state: 'Uttar Pradesh', gstin: '09AAAAA1111A1Z1', website: 'https://dell.in', avgRating: 4.8, totalRatings: 12 },
  { id: 2, vendorCode: 'VEN-HPE-102', name: 'HP Enterprise Solutions', contactPerson: 'Arvind Sharma', email: 'corporate@hpe.com', phone: '+91 99999 88882', address: 'Cyber City, Phase 3', city: 'Gurugram', state: 'Haryana', gstin: '06BBBBB2222B2Z2', website: 'https://hpe.com', avgRating: 4.5, totalRatings: 8 },
  { id: 3, vendorCode: 'VEN-LEN-103', name: 'Lenovo Global Store', contactPerson: 'Sunita Nair', email: 'retail@lenovo.in', phone: '+91 99999 88883', address: 'MG Road, Landmark Tower', city: 'Bengaluru', state: 'Karnataka', gstin: '29CCCCC3333C3Z3', website: 'https://lenovo.com', avgRating: 4.2, totalRatings: 9 },
  { id: 4, vendorCode: 'VEN-APL-104', name: 'Apple Business Corp', contactPerson: 'Vikram Bose', email: 'enterprise@apple.com', phone: '+91 99999 88884', address: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', gstin: '27DDDDD4444D4Z4', website: 'https://apple.com/in', avgRating: 4.9, totalRatings: 15 },
  { id: 5, vendorCode: 'VEN-CIS-105', name: 'Cisco Systems Ltd', contactPerson: 'Karan Malhotra', email: 'partners@cisco.com', phone: '+91 99999 88885', address: 'Tech Park Area, Whitefield', city: 'Bengaluru', state: 'Karnataka', gstin: '29EEEEE5555E5Z5', website: 'https://cisco.com', avgRating: 4.7, totalRatings: 11 },
  { id: 6, vendorCode: 'VEN-CAN-106', name: 'Canon Office World', contactPerson: 'Pooja Gupta', email: 'support@canonoffice.in', phone: '+91 99999 88886', address: 'Nehru Place Plaza', city: 'New Delhi', state: 'Delhi', gstin: '07FFFFF6666F6Z6', website: 'https://canon.in', avgRating: 4.1, totalRatings: 6 },
  { id: 7, vendorCode: 'VEN-EPS-107', name: 'Epson Digital Store', contactPerson: 'Sanjay Pandey', email: 'orders@epsonstore.in', phone: '+91 99999 88887', address: 'Electronic Zone, Phase 1', city: 'Pune', state: 'Maharashtra', gstin: '27GGGGG7777G7Z7', website: 'https://epson.co.in', avgRating: 4.3, totalRatings: 7 },
  { id: 8, vendorCode: 'VEN-DLK-108', name: 'D-Link Networking', contactPerson: 'Deepak Sen', email: 'sales@dlink.co.in', phone: '+91 99999 88888', address: 'Industrial Estate, Verna', city: 'Panaji', state: 'Goa', gstin: '30HHHHH8888H8Z8', website: 'https://dlink.co.in', avgRating: 4.0, totalRatings: 5 },
  { id: 9, vendorCode: 'VEN-SAM-109', name: 'Samsung Electronics', contactPerson: 'Neha Sethi', email: 'corporate.b2b@samsung.com', phone: '+91 99999 88889', address: 'Okhla Industrial Area', city: 'New Delhi', state: 'Delhi', gstin: '07IIIII9999I9Z9', website: 'https://samsung.com/in', avgRating: 4.6, totalRatings: 10 },
  { id: 10, vendorCode: 'VEN-LGE-110', name: 'LG Commercial Displays', contactPerson: 'Simran Singh', email: 'b2b.display@lg.com', phone: '+91 99999 88890', address: 'Greater Noida Express Link', city: 'Noida', state: 'Uttar Pradesh', gstin: '09JJJJJ0000J0Z0', website: 'https://lg.com/in', avgRating: 4.4, totalRatings: 8 },
  { id: 11, vendorCode: 'VEN-VOL-111', name: 'Voltas AC Labs', contactPerson: 'Sunil Bhat', email: 'cooling@voltas.com', phone: '+91 99999 88891', address: 'Chinchwad Link Road', city: 'Pune', state: 'Maharashtra', gstin: '27KKKKK1111K1Z1', website: 'https://voltas.com', avgRating: 4.2, totalRatings: 7 },
  { id: 12, vendorCode: 'VEN-BLU-112', name: 'Blue Star Cooling', contactPerson: 'Meera Pillai', email: 'ac.orders@bluestar.in', phone: '+91 99999 88892', address: 'Kanjurmarg East', city: 'Mumbai', state: 'Maharashtra', gstin: '27LLLLL2222L2Z2', website: 'https://bluestarindia.com', avgRating: 4.3, totalRatings: 9 },
  { id: 13, vendorCode: 'VEN-GOD-113', name: 'Godrej Interio Office', contactPerson: 'Vijay Hegde', email: 'office@godrejinterio.com', phone: '+91 99999 88893', address: 'Vikhroli Industrial Complex', city: 'Mumbai', state: 'Maharashtra', gstin: '27MMMMM3333M3Z3', website: 'https://godrejinterio.com', avgRating: 4.5, totalRatings: 11 },
  { id: 14, vendorCode: 'VEN-STC-114', name: 'Steelcase Furniture', contactPerson: 'Amit Gowda', email: 'sales@steelcase.in', phone: '+91 99999 88894', address: 'Richmond Road, Business Hub', city: 'Bengaluru', state: 'Karnataka', gstin: '29NNNNN4444N4Z4', website: 'https://steelcase.asia', avgRating: 4.7, totalRatings: 12 },
  { id: 15, vendorCode: 'VEN-TAT-115', name: 'Tata Motors Commercial', contactPerson: 'Rohan Shinde', email: 'ev.fleet@tata.com', phone: '+91 99999 88895', address: 'Fort Area, H.O.', city: 'Mumbai', state: 'Maharashtra', gstin: '27OOOOO5555O5Z5', website: 'https://tatamotors.com', avgRating: 4.6, totalRatings: 14 },
  { id: 16, vendorCode: 'VEN-MAH-116', name: 'Mahindra Logistics', contactPerson: 'Jyoti Kadam', email: 'logistics@mahindra.com', phone: '+91 99999 88896', address: 'Worli Gateway Building', city: 'Mumbai', state: 'Maharashtra', gstin: '27PPPPP6666P6Z6', website: 'https://mahindralogistics.com', avgRating: 4.4, totalRatings: 8 },
  { id: 17, vendorCode: 'VEN-MSF-117', name: 'Microsoft Licensing', contactPerson: 'Rahul Sethi', email: 'licensing@microsoft.in', phone: '+91 99999 88897', address: 'DLF Cyber Park', city: 'Gurugram', state: 'Haryana', gstin: '06QQQQQ7777Q7Z7', website: 'https://microsoft.com/en-in', avgRating: 4.8, totalRatings: 16 },
  { id: 18, vendorCode: 'VEN-AWS-118', name: 'AWS Services India', contactPerson: 'Kiran Bhasin', email: 'cloud@amazon.in', phone: '+91 99999 88898', address: 'World Trade Center', city: 'Bengaluru', state: 'Karnataka', gstin: '29RRRRR8888R8Z8', website: 'https://aws.amazon.com', avgRating: 4.9, totalRatings: 17 },
  { id: 19, vendorCode: 'VEN-ORC-119', name: 'Oracle Database Solutions', contactPerson: 'Pooja Oberoi', email: 'db.sales@oracle.com', phone: '+91 99999 88899', address: 'Bannerghatta Road Tech', city: 'Bengaluru', state: 'Karnataka', gstin: '29SSSSS9999S9Z9', website: 'https://oracle.com/in', avgRating: 4.5, totalRatings: 9 },
  { id: 20, vendorCode: 'VEN-ADB-120', name: 'Adobe Business Center', contactPerson: 'Sanjay Anand', email: 'cc.business@adobe.com', phone: '+91 99999 88900', address: 'Noida Sector 132 Hub', city: 'Noida', state: 'Uttar Pradesh', gstin: '09TTTTT0000T0Z0', website: 'https://adobe.com/in', avgRating: 4.7, totalRatings: 10 },
  { id: 21, vendorCode: 'VEN-GEN-121', name: 'Generic IT Accessories', contactPerson: 'Ravi Verma', email: 'ravi@genit.com', phone: '+91 99999 88901', address: 'Lamington Road Market', city: 'Mumbai', state: 'Maharashtra', gstin: '27UUUUU1111U1Z1', website: 'https://genitaccessories.in', avgRating: 3.9, totalRatings: 5 },
  { id: 22, vendorCode: 'VEN-SYS-122', name: 'Sysnet Systems Ltd', contactPerson: 'Deepak Saxena', email: 'support@sysnet.in', phone: '+91 99999 88902', address: 'Mayur Vihar, Phase 1', city: 'Delhi', state: 'Delhi', gstin: '07VVVVV2222V2Z2', website: 'https://sysnet.in', avgRating: 4.2, totalRatings: 8 },
  { id: 23, vendorCode: 'VEN-NET-123', name: 'Netlink Networking Solutions', contactPerson: 'Nitin Deshmukh', email: 'deals@netlink.com', phone: '+91 99999 88903', address: 'Vashi Railway Station Complex', city: 'Navi Mumbai', state: 'Maharashtra', gstin: '27WWWWW3333W3Z3', website: 'https://netlink.co.in', avgRating: 4.3, totalRatings: 6 },
  { id: 24, vendorCode: 'VEN-FAC-124', name: 'Facility Infrastructure Corp', contactPerson: 'Karan Kulkarni', email: 'infra@facilitycorp.com', phone: '+91 99999 88904', address: 'Kolkata Salt Lake Sector 5', city: 'Kolkata', state: 'West Bengal', gstin: '19XXXXX4444X4Z4', website: 'https://facilitycorp.com', avgRating: 4.0, totalRatings: 4 },
  { id: 25, vendorCode: 'VEN-SOF-125', name: 'SoftwareONE Licensing', contactPerson: 'Meeta Sen', email: 'quotes@softwareone.com', phone: '+91 99999 88905', address: 'Safdarjung Enclave', city: 'New Delhi', state: 'Delhi', gstin: '07YYYYY5555Y5Z5', website: 'https://softwareone.com', avgRating: 4.4, totalRatings: 9 }
]

export const demoVendorPage = {
  content: demoVendors,
  totalElements: demoVendors.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

// ── 25 Maintenance Records ───────────────────────────────────────────────────
export const demoMaintenance = [
  { id: 1, assetId: 1, assetName: 'Dell Latitude 5420', maintenanceType: 'Hardware Issue', startDate: '2025-05-10', nextDueDate: '2025-11-10', status: 'COMPLETED', cost: 2400, technician: 'Dell Service Center' },
  { id: 2, assetId: 4, assetName: 'Lenovo ThinkPad T14', maintenanceType: 'Keyboard Replaced', startDate: '2025-04-18', nextDueDate: '2025-10-18', status: 'COMPLETED', cost: 1800, technician: 'Lenovo Support Team' },
  { id: 3, assetId: 12, assetName: 'Voltas Vectra 1.5T AC', maintenanceType: 'AC Filter Cleanup', startDate: '2025-03-12', nextDueDate: '2025-09-12', status: 'COMPLETED', cost: 800, technician: 'Voltas Support' },
  { id: 4, assetId: 19, assetName: 'Cisco Catalyst 9300', maintenanceType: 'Network Port Repair', startDate: '2025-05-20', nextDueDate: '2025-11-20', status: 'COMPLETED', cost: 3200, technician: 'Cisco Certified Tech' },
  { id: 5, assetId: 2, assetName: 'HP EliteBook 840', maintenanceType: 'RAM Upgrade (16GB)', startDate: '2025-05-25', nextDueDate: null, status: 'COMPLETED', cost: 4500, technician: 'HP Service Lab' },
  { id: 6, assetId: 3, assetName: 'Apple MacBook Pro 14', maintenanceType: 'Operating System Reinstalled', startDate: '2025-06-01', nextDueDate: null, status: 'COMPLETED', cost: 1200, technician: 'Apple Care Genius' },
  { id: 7, assetId: 5, assetName: 'Dell OptiPlex 7090', maintenanceType: 'SSD Swap (512GB)', startDate: '2025-05-28', nextDueDate: null, status: 'COMPLETED', cost: 3800, technician: 'Dell Support Team' },
  { id: 8, assetId: 6, assetName: 'HP LaserJet Pro M404dn', maintenanceType: 'Toner Replacement', startDate: '2025-06-02', nextDueDate: '2025-09-02', status: 'COMPLETED', cost: 1500, technician: 'In-house IT Staff' },
  { id: 9, assetId: 7, assetName: 'Canon imageRUNNER 2206', maintenanceType: 'Fuser Unit Servicing', startDate: '2025-05-15', nextDueDate: '2025-11-15', status: 'COMPLETED', cost: 5500, technician: 'Canon Service Partner' },
  { id: 10, assetId: 8, assetName: 'Dell PowerEdge R750', maintenanceType: 'Power Supply Swap', startDate: '2025-05-29', nextDueDate: '2025-11-29', status: 'COMPLETED', cost: 12000, technician: 'Dell Enterprise Pro' },
  { id: 11, assetId: 10, assetName: 'Aruba CX 6100 Switch', maintenanceType: 'Firmware Upgrades', startDate: '2025-06-05', nextDueDate: '2025-12-05', status: 'COMPLETED', cost: 0, technician: 'In-house Network Lead' },
  { id: 12, assetId: 13, assetName: 'Steelcase Ergonomic Chair', maintenanceType: 'Gas Cylinder Replaced', startDate: '2025-04-12', nextDueDate: null, status: 'COMPLETED', cost: 2200, technician: 'Steelcase Vendor Support' },
  { id: 13, assetId: 14, assetName: 'Tata Tigor EV', maintenanceType: 'Battery Health Diagnosis', startDate: '2025-05-02', nextDueDate: '2025-11-02', status: 'COMPLETED', cost: 6500, technician: 'Tata Motors Workshop' },
  { id: 14, assetId: 16, assetName: 'HP EliteDesk 800', maintenanceType: 'Thermal Paste Reapplied', startDate: '2025-06-03', nextDueDate: null, status: 'COMPLETED', cost: 600, technician: 'In-house IT Staff' },
  { id: 15, assetId: 21, assetName: 'Dell Latitude 3420', maintenanceType: 'Broken Hinge Repair', startDate: '2025-06-07', nextDueDate: null, status: 'COMPLETED', cost: 3500, technician: 'Sysnet Partner Tech' },
  { id: 16, assetId: 23, assetName: 'Blue Star 1.5T AC', maintenanceType: 'Gas Leak Fix', startDate: '2025-05-18', nextDueDate: '2025-11-18', status: 'COMPLETED', cost: 4200, technician: 'Blue Star Service Desk' },
  { id: 17, assetId: 11, assetName: 'Epson EB-E01 Projector', maintenanceType: 'Lens Cleaning & Fan Check', startDate: '2025-06-09', nextDueDate: null, status: 'ONGOING', cost: 0, technician: 'In-house Facilities Team' },
  { id: 18, assetId: 15, assetName: 'Microsoft Office 365 Pro', maintenanceType: 'Admin Console Audit', startDate: '2025-06-08', nextDueDate: null, status: 'ONGOING', cost: 0, technician: 'IT Security Lead' },
  { id: 19, assetId: 17, assetName: 'Sony VPL-DX221 Projector', maintenanceType: 'Bulb Replacement', startDate: '2025-06-08', nextDueDate: null, status: 'ONGOING', cost: 0, technician: 'Sony Service Center' },
  { id: 20, assetId: 18, assetName: 'Godrej Interio L-Desk', maintenanceType: 'Drawer Lock Replaced', startDate: '2025-06-09', nextDueDate: null, status: 'PENDING', cost: 0, technician: 'Facilities Carpentry' },
  { id: 21, assetId: 20, assetName: 'Apple MacBook Air M2', maintenanceType: 'Keyboard Cleaning', startDate: '2025-06-09', nextDueDate: null, status: 'PENDING', cost: 0, technician: 'Apple Care Genius' },
  { id: 22, assetId: 22, assetName: 'HP LaserJet Enterprise', maintenanceType: 'Paper Jam Roller Fix', startDate: '2025-06-09', nextDueDate: null, status: 'PENDING', cost: 0, technician: 'In-house IT Staff' },
  { id: 23, assetId: 24, assetName: 'Godrej Ergonomic Chair', maintenanceType: 'Wheel Caster Swapped', startDate: '2025-06-09', nextDueDate: null, status: 'PENDING', cost: 0, technician: 'Facilities Carpentry' },
  { id: 24, assetId: 25, assetName: 'Adobe Creative Cloud', maintenanceType: 'License Deployment Issue', startDate: '2025-06-09', nextDueDate: null, status: 'PENDING', cost: 0, technician: 'Adobe Partner Support' },
  { id: 25, assetId: 9, assetName: 'Cisco ISR 4331 Router', maintenanceType: 'Power Adapter Swap', startDate: '2025-06-09', nextDueDate: null, status: 'PENDING', cost: 0, technician: 'In-house Network Lead' }
]

export const demoMaintenancePage = {
  content: demoMaintenance,
  totalElements: demoMaintenance.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

// ── 25 Warranties ────────────────────────────────────────────────────────────
export const demoWarranties = [
  { id: 1, assetId: 1, assetName: 'Dell Latitude 5420', providerName: 'Dell India Tech', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10001', startDate: '2025-01-15', expiryDate: '2028-01-15' },
  { id: 2, assetId: 2, assetName: 'HP EliteBook 840', providerName: 'HP Enterprise Solutions', warrantyType: 'EXTENDED', contractNumber: 'WNT-10002', startDate: '2025-02-10', expiryDate: '2028-02-10' },
  { id: 3, assetId: 3, assetName: 'Apple MacBook Pro 14', providerName: 'Apple Business Corp', warrantyType: 'COMPREHENSIVE', contractNumber: 'WNT-10003', startDate: '2025-03-01', expiryDate: '2026-03-01' },
  { id: 4, assetId: 4, assetName: 'Lenovo ThinkPad T14', providerName: 'Lenovo Global Store', warrantyType: 'ON_SITE', contractNumber: 'WNT-10004', startDate: '2024-11-20', expiryDate: '2027-11-20' },
  { id: 5, assetId: 5, assetName: 'Dell OptiPlex 7090', providerName: 'Dell India Tech', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10005', startDate: '2024-05-15', expiryDate: '2027-05-15' },
  { id: 6, assetId: 6, assetName: 'HP LaserJet Pro M404dn', providerName: 'HP Enterprise Solutions', warrantyType: 'THIRD_PARTY', contractNumber: 'WNT-10006', startDate: '2024-06-18', expiryDate: '2025-06-18' },
  { id: 7, assetId: 7, assetName: 'Canon imageRUNNER 2206', providerName: 'Canon Office World', warrantyType: 'COMPREHENSIVE', contractNumber: 'WNT-10007', startDate: '2024-07-22', expiryDate: '2026-07-22' },
  { id: 8, assetId: 8, assetName: 'Dell PowerEdge R750', providerName: 'Dell India Tech', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10008', startDate: '2025-01-10', expiryDate: '2030-01-10' },
  { id: 9, assetId: 9, assetName: 'Cisco ISR 4331 Router', providerName: 'Cisco Systems Ltd', warrantyType: 'ON_SITE', contractNumber: 'WNT-10009', startDate: '2024-09-05', expiryDate: '2027-09-05' },
  { id: 10, assetId: 10, assetName: 'Aruba CX 6100 Switch', providerName: 'Cisco Systems Ltd', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10010', startDate: '2024-10-12', expiryDate: '2027-10-12' },
  { id: 11, assetId: 11, assetName: 'Epson EB-E01 Projector', providerName: 'Epson Digital Store', warrantyType: 'EXTENDED', contractNumber: 'WNT-10011', startDate: '2024-12-05', expiryDate: '2025-12-05' },
  { id: 12, assetId: 12, assetName: 'Voltas Vectra 1.5T AC', providerName: 'Voltas AC Labs', warrantyType: 'COMPREHENSIVE', contractNumber: 'WNT-10012', startDate: '2023-04-10', expiryDate: '2026-04-10' },
  { id: 13, assetId: 13, assetName: 'Steelcase Ergonomic Chair', providerName: 'Steelcase Furniture', warrantyType: 'THIRD_PARTY', contractNumber: 'WNT-10013', startDate: '2024-08-14', expiryDate: '2029-08-14' },
  { id: 14, assetId: 14, assetName: 'Tata Tigor EV', providerName: 'Tata Motors Commercial', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10014', startDate: '2024-02-18', expiryDate: '2027-02-18' },
  { id: 15, assetId: 15, assetName: 'Microsoft Office 365 Pro', providerName: 'Microsoft Licensing', warrantyType: 'EXTENDED', contractNumber: 'WNT-10015', startDate: '2025-05-01', expiryDate: '2026-05-01' },
  { id: 16, assetId: 16, assetName: 'HP EliteDesk 800', providerName: 'HP Enterprise Solutions', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10016', startDate: '2024-11-15', expiryDate: '2027-11-15' },
  { id: 17, assetId: 17, assetName: 'Sony VPL-DX221 Projector', providerName: 'Apple Business Corp', warrantyType: 'THIRD_PARTY', contractNumber: 'WNT-10017', startDate: '2024-03-24', expiryDate: '2025-03-24' },
  { id: 18, assetId: 18, assetName: 'Godrej Interio L-Desk', providerName: 'Godrej Interio Office', warrantyType: 'COMPREHENSIVE', contractNumber: 'WNT-10018', startDate: '2023-11-02', expiryDate: '2026-11-02' },
  { id: 19, assetId: 19, assetName: 'Cisco Catalyst 9300', providerName: 'Cisco Systems Ltd', warrantyType: 'ON_SITE', contractNumber: 'WNT-10019', startDate: '2024-05-20', expiryDate: '2027-05-20' },
  { id: 20, assetId: 20, assetName: 'Apple MacBook Air M2', providerName: 'Apple Business Corp', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10020', startDate: '2025-04-18', expiryDate: '2026-04-18' },
  { id: 21, assetId: 21, assetName: 'Dell Latitude 3420', providerName: 'Dell India Tech', warrantyType: 'EXTENDED', contractNumber: 'WNT-10021', startDate: '2025-05-22', expiryDate: '2028-05-22' },
  { id: 22, assetId: 22, assetName: 'HP LaserJet Enterprise', providerName: 'HP Enterprise Solutions', warrantyType: 'MANUFACTURER', contractNumber: 'WNT-10022', startDate: '2024-08-20', expiryDate: '2025-08-20' },
  { id: 23, assetId: 23, assetName: 'Blue Star 1.5T AC', providerName: 'Blue Star Cooling', warrantyType: 'COMPREHENSIVE', contractNumber: 'WNT-10023', startDate: '2023-06-15', expiryDate: '2026-06-15' },
  { id: 24, assetId: 24, assetName: 'Godrej Ergonomic Chair', providerName: 'Godrej Interio Office', warrantyType: 'THIRD_PARTY', contractNumber: 'WNT-10024', startDate: '2024-09-10', expiryDate: '2027-09-10' },
  { id: 25, assetId: 25, assetName: 'Adobe Creative Cloud', providerName: 'Adobe Business Center', warrantyType: 'EXTENDED', contractNumber: 'WNT-10025', startDate: '2025-01-20', expiryDate: '2026-01-20' }
]

export const demoWarrantyPage = {
  content: demoWarranties,
  totalElements: demoWarranties.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

// ── 25 Depreciation Entries ──────────────────────────────────────────────────
export const demoDepreciation = [
  { id: 1, assetId: 1, assetName: 'Dell Latitude 5420', financialYear: '2025-26', openingValue: 85000, depreciationRate: 0.15, depreciationAmt: 12750, closingValue: 72250, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 2, assetId: 2, assetName: 'HP EliteBook 840', financialYear: '2025-26', openingValue: 92000, depreciationRate: 0.15, depreciationAmt: 13800, closingValue: 78200, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 3, assetId: 3, assetName: 'Apple MacBook Pro 14', financialYear: '2025-26', openingValue: 185000, depreciationRate: 0.20, depreciationAmt: 37000, closingValue: 148000, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 4, assetId: 4, assetName: 'Lenovo ThinkPad T14', financialYear: '2025-26', openingValue: 78000, depreciationRate: 0.15, depreciationAmt: 11700, closingValue: 66300, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 5, assetId: 5, assetName: 'Dell OptiPlex 7090', financialYear: '2025-26', openingValue: 65000, depreciationRate: 0.15, depreciationAmt: 9750, closingValue: 55250, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 6, assetId: 6, assetName: 'HP LaserJet Pro M404dn', financialYear: '2025-26', openingValue: 28000, depreciationRate: 0.10, depreciationAmt: 2800, closingValue: 25200, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 7, assetId: 7, assetName: 'Canon imageRUNNER 2206', financialYear: '2025-26', openingValue: 45000, depreciationRate: 0.10, depreciationAmt: 4500, closingValue: 40500, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 8, assetId: 8, assetName: 'Dell PowerEdge R750', financialYear: '2025-26', openingValue: 260000, depreciationRate: 0.10, depreciationAmt: 26000, closingValue: 234000, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 9, assetId: 9, assetName: 'Cisco ISR 4331 Router', financialYear: '2025-26', openingValue: 48000, depreciationRate: 0.10, depreciationAmt: 4800, closingValue: 43200, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 10, assetId: 10, assetName: 'Aruba CX 6100 Switch', financialYear: '2025-26', openingValue: 62000, depreciationRate: 0.10, depreciationAmt: 6200, closingValue: 55800, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 11, assetId: 11, assetName: 'Epson EB-E01 Projector', financialYear: '2025-26', openingValue: 35000, depreciationRate: 0.15, depreciationAmt: 5250, closingValue: 29750, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 12, assetId: 12, assetName: 'Voltas Vectra 1.5T AC', financialYear: '2025-26', openingValue: 40000, depreciationRate: 0.15, depreciationAmt: 6000, closingValue: 34000, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 13, assetId: 13, assetName: 'Steelcase Ergonomic Chair', financialYear: '2025-26', openingValue: 16000, depreciationRate: 0.10, depreciationAmt: 1600, closingValue: 14400, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 14, assetId: 14, assetName: 'Tata Tigor EV', financialYear: '2025-26', openingValue: 980000, depreciationRate: 0.20, depreciationAmt: 196000, closingValue: 784000, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 15, assetId: 15, assetName: 'Microsoft Office 365 Pro', financialYear: '2025-26', openingValue: 12000, depreciationRate: 0.50, depreciationAmt: 6000, closingValue: 6000, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 16, assetId: 16, assetName: 'HP EliteDesk 800', financialYear: '2025-26', openingValue: 58000, depreciationRate: 0.15, depreciationAmt: 8700, closingValue: 49300, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 17, assetId: 17, assetName: 'Sony VPL-DX221 Projector', financialYear: '2025-26', openingValue: 38000, depreciationRate: 0.15, depreciationAmt: 5700, closingValue: 32300, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 18, assetId: 18, assetName: 'Godrej Interio L-Desk', financialYear: '2025-26', openingValue: 14000, depreciationRate: 0.10, depreciationAmt: 1400, closingValue: 12600, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 19, assetId: 19, assetName: 'Cisco Catalyst 9300', financialYear: '2025-26', openingValue: 72000, depreciationRate: 0.10, depreciationAmt: 7200, closingValue: 64800, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 20, assetId: 20, assetName: 'Apple MacBook Air M2', financialYear: '2025-26', openingValue: 115000, depreciationRate: 0.15, depreciationAmt: 17250, closingValue: 97750, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 21, assetId: 21, assetName: 'Dell Latitude 3420', financialYear: '2025-26', openingValue: 65000, depreciationRate: 0.15, depreciationAmt: 9750, closingValue: 55250, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 22, assetId: 22, assetName: 'HP LaserJet Enterprise', financialYear: '2025-26', openingValue: 39000, depreciationRate: 0.10, depreciationAmt: 3900, closingValue: 35100, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 23, assetId: 23, assetName: 'Blue Star 1.5T AC', financialYear: '2025-26', openingValue: 44000, depreciationRate: 0.15, depreciationAmt: 6600, closingValue: 37400, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 24, assetId: 24, assetName: 'Godrej Ergonomic Chair', financialYear: '2025-26', openingValue: 11000, depreciationRate: 0.10, depreciationAmt: 1100, closingValue: 9900, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' },
  { id: 25, assetId: 25, assetName: 'Adobe Creative Cloud', financialYear: '2025-26', openingValue: 45000, depreciationRate: 0.50, depreciationAmt: 22500, closingValue: 22500, method: 'STRAIGHT_LINE', calculatedAt: '2026-03-31' }
]

export const demoDepreciationPage = {
  content: demoDepreciation,
  totalElements: demoDepreciation.length,
  totalPages: 1,
  number: 0,
  size: 20,
}

export const demoCategories = [
  { id: 1, name: 'Laptops' },
  { id: 2, name: 'Desktops' },
  { id: 3, name: 'Printers' },
  { id: 4, name: 'Servers' },
]

export const demoDepartments = [
  { id: 1, name: 'Information Technology' },
  { id: 2, name: 'CSE' },
  { id: 3, name: 'Administration & Facilities' },
  { id: 4, name: 'Finance & Accounts' },
]

export const demoCharts = {
  category: [
    { name: 'Laptops', value: 94 },
    { name: 'Desktops', value: 61 },
    { name: 'Printers', value: 22 },
    { name: 'Servers', value: 37 },
  ],
  status: [
    { name: 'Available', value: 82 },
    { name: 'Assigned', value: 139 },
    { name: 'Under Repair', value: 14 },
    { name: 'Disposed', value: 13 },
  ],
  health: [
    { name: 'Excellent', value: 76 },
    { name: 'Good', value: 88 },
    { name: 'Average', value: 51 },
    { name: 'Poor', value: 14 },
    { name: 'Critical', value: 9 },
  ],
  department: [
    { name: 'IT', value: 58 },
    { name: 'CSE', value: 72 },
    { name: 'Admin', value: 43 },
    { name: 'Finance', value: 28 },
  ],
}
