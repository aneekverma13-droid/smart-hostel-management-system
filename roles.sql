-- =====================================================================
-- Database roles (role-based access control at the DBMS level)
-- Run AFTER schema.sql as a privileged user.
-- The Express backend connects as 'hostel_app'. Per-user access
-- (student/warden/admin/staff) is enforced by the backend using JWT roles;
-- the DB roles below define what each role may do if you connect as that role.
-- CHANGE THE PASSWORD before any real deployment.
-- =====================================================================
USE hostel;

CREATE ROLE IF NOT EXISTS student_role, warden_role, staff_role, admin_role;

-- Student: browse availability, request a bed, raise complaints
GRANT SELECT ON hostel.v_available_beds     TO student_role;
GRANT SELECT ON hostel.v_occupancy          TO student_role;
GRANT SELECT, INSERT ON hostel.allocation_request TO student_role;
GRANT SELECT, INSERT ON hostel.complaint    TO student_role;
GRANT SELECT ON hostel.complaint_history    TO student_role;
GRANT SELECT ON hostel.notification         TO student_role;
GRANT SELECT, INSERT ON hostel.payment      TO student_role;
GRANT EXECUTE ON PROCEDURE hostel.allocate_bed TO student_role;

-- Maintenance staff: see complaints, change only the status column
GRANT SELECT ON hostel.complaint            TO staff_role;
GRANT UPDATE (status) ON hostel.complaint   TO staff_role;
GRANT SELECT ON hostel.complaint_history    TO staff_role;

-- Warden: read everything, manage requests/complaints, run allocation procedures
GRANT SELECT ON hostel.*                    TO warden_role;
GRANT INSERT, UPDATE ON hostel.allocation_request TO warden_role;
GRANT INSERT, UPDATE ON hostel.complaint    TO warden_role;
GRANT EXECUTE ON PROCEDURE hostel.allocate_bed      TO warden_role;
GRANT EXECUTE ON PROCEDURE hostel.vacate_allocation TO warden_role;
GRANT EXECUTE ON PROCEDURE hostel.transfer_bed      TO warden_role;

-- Admin: everything
GRANT ALL PRIVILEGES ON hostel.* TO admin_role;

-- Application account used by the backend
CREATE USER IF NOT EXISTS 'hostel_app'@'localhost' IDENTIFIED BY 'ChangeMe123!';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON hostel.* TO 'hostel_app'@'localhost';
