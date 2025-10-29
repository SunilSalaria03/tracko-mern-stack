import bcrypt from 'bcryptjs';
import userModel from '../models/userModel';
 
export const createOrCheckAdmin = async (): Promise<void> => {
  try {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

    // Check and create Super Admin (role: 0)
    const superAdminExists = await userModel.findOne({ 
      role: 0, 
      isDeleted: false 
    });

    if (!superAdminExists) {
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
      const superAdminHashedPassword = await bcrypt.hash(superAdminPassword, saltRounds);

      const superAdminData = {
        role: 0,
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@tracko.com',
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        phoneNumber: process.env.SUPER_ADMIN_PHONE || '1234567890',
        countryCode: process.env.SUPER_ADMIN_COUNTRY_CODE || '+1',
        password: superAdminHashedPassword,
        status: 1,
        Designation: 'Super Admin',
        Department: 'Administration',
        isDeleted: false,
        tempPassword: null,
      };

      const superAdmin = await userModel.create(superAdminData);
      console.log('✓ Super admin created successfully!');
      console.log(`  Email: ${superAdmin.email}`);
      console.log(`  Password: ${superAdminPassword}`);
    } else {
      console.log('✓ Super admin already exists');
    }

    // Check and create Admin (role: 1)
    const adminExists = await userModel.findOne({ 
      role: 1, 
      isDeleted: false 
    });

    if (!adminExists) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
      const adminHashedPassword = await bcrypt.hash(adminPassword, saltRounds);

      const adminData = {
        role: 1,
        email: process.env.ADMIN_EMAIL || 'admin@tracko.com',
        name: process.env.ADMIN_NAME || 'Admin',
        phoneNumber: process.env.ADMIN_PHONE || '9876543210',
        countryCode: process.env.ADMIN_COUNTRY_CODE || '+1',
        password: adminHashedPassword,
        status: 1,
        Designation: 'Admin',
        Department: 'Administration',
        isDeleted: false,
        tempPassword: null,
      };

      const admin = await userModel.create(adminData);
      console.log('✓ Admin created successfully!');
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: ${adminPassword}`);
    } else {
      console.log('✓ Admin already exists');
    }

    console.log('⚠ Please change the default passwords after first login.');
  } catch (error) {
    console.error('Error creating or checking admin:', error);
    throw error;
  }
};

