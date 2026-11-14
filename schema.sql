-- =====================================================================
-- Smart Hostel Room Selection and Maintenance System
-- DBMS engine: schema v2 (13 tables, 3NF), procedures, triggers, views
-- Runs on MySQL 8.0.16+ and MariaDB 10.4+
-- Usage:  mysql -u root -p < schema.sql
-- =====================================================================
DROP DATABASE IF EXISTS hostel;
CREATE DATABASE hostel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hostel;

-- ---------- 1. USERS (every person who can log in) ----------
CREATE TABLE users (
  user_id       INT PRIMARY KEY AUTO_INCREMENT,
  username      VARCHAR(30)  NOT NULL UNIQUE,        -- SRN / staff id / warden id
  email         VARCHAR(100) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  avatar_url    VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('Student','Warden','Admin','Staff') NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------- 2. BLOCK (a hostel building) ----------
CREATE TABLE block (
  block_id       INT PRIMARY KEY AUTO_INCREMENT,
  block_name     VARCHAR(30) NOT NULL UNIQUE,
  total_floors   INT NOT NULL CHECK (total_floors > 0),
  gender         ENUM('Male','Female','Co-ed') NOT NULL,
  warden_user_id INT NULL,
  FOREIGN KEY (warden_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ---------- 3. ROOM_TYPE (type determines capacity and base fee) ----------
CREATE TABLE room_type (
  room_type VARCHAR(20) PRIMARY KEY,
  capacity  INT NOT NULL CHECK (capacity BETWEEN 1 AND 6),
  base_fee  INT NOT NULL CHECK (base_fee >= 0),
  ac_fee    INT NOT NULL CHECK (ac_fee >= 0)          -- surcharge for AC rooms
);

-- ---------- 4. ROOM ----------
CREATE TABLE room (
  room_id     INT PRIMARY KEY AUTO_INCREMENT,
  block_id    INT NOT NULL,
  room_type   VARCHAR(20) NOT NULL,
  floor_no    INT NOT NULL CHECK (floor_no >= 0),
  room_no     VARCHAR(10) NOT NULL,
  ac          BOOLEAN NOT NULL DEFAULT FALSE,
  branch_pref VARCHAR(10) NULL,
  year_pref   INT NULL CHECK (year_pref BETWEEN 1 AND 5),
  UNIQUE (block_id, room_no),
  FOREIGN KEY (block_id)  REFERENCES block(block_id)      ON DELETE RESTRICT,
  FOREIGN KEY (room_type) REFERENCES room_type(room_type) ON DELETE RESTRICT
);

-- ---------- 5. BED ----------
CREATE TABLE bed (
  bed_id  INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  bed_no  INT NOT NULL,
  status  ENUM('Available','Occupied','Under Maintenance') NOT NULL DEFAULT 'Available',
  UNIQUE (room_id, bed_no),
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE RESTRICT
);

-- ---------- 6. STUDENT (student-specific facts; identity lives in USERS) ----------
CREATE TABLE student (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL UNIQUE,
  department VARCHAR(50) NOT NULL,
  year       INT NOT NULL CHECK (year BETWEEN 1 AND 5),
  gender     ENUM('Male','Female') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- ---------- 7. STAFF (maintenance personnel) ----------
CREATE TABLE staff (
  staff_id       INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT NOT NULL UNIQUE,
  specialization VARCHAR(40),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- ---------- 8. ALLOCATION_REQUEST (student asks for a specific bed) ----------
-- pending_student: unique => a student can have at most ONE open request.
CREATE TABLE allocation_request (
  request_id      INT PRIMARY KEY AUTO_INCREMENT,
  student_id      INT NOT NULL,
  bed_id          INT NOT NULL,
  request_date    DATETIME DEFAULT CURRENT_TIMESTAMP,
  status          ENUM('Pending','Allocated','Rejected') NOT NULL DEFAULT 'Pending',
  remarks         VARCHAR(255),
  resolved_at     DATETIME NULL,
  pending_student INT GENERATED ALWAYS AS (IF(status = 'Pending', student_id, NULL)) STORED,
  UNIQUE KEY uq_pending_student (pending_student),
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE RESTRICT,
  FOREIGN KEY (bed_id)     REFERENCES bed(bed_id)         ON DELETE RESTRICT
);

-- ---------- 9. ALLOCATION ----------
-- active_bed / active_student are NULL unless the row is Active.
-- UNIQUE on them = at most ONE Active allocation per bed and per student,
-- while any number of past (Vacated/Transferred) rows are allowed.
CREATE TABLE allocation (
  allocation_id  INT PRIMARY KEY AUTO_INCREMENT,
  student_id     INT NOT NULL,
  bed_id         INT NOT NULL,
  request_id     INT NULL,
  allocated_date DATE NOT NULL,
  vacated_date   DATE NULL,
  status         ENUM('Active','Transferred','Vacated') NOT NULL DEFAULT 'Active',
  active_bed     INT GENERATED ALWAYS AS (IF(status = 'Active', bed_id, NULL))     STORED,
  active_student INT GENERATED ALWAYS AS (IF(status = 'Active', student_id, NULL)) STORED,
  UNIQUE KEY uq_active_bed     (active_bed),
  UNIQUE KEY uq_active_student (active_student),
  FOREIGN KEY (student_id) REFERENCES student(student_id)            ON DELETE RESTRICT,
  FOREIGN KEY (bed_id)     REFERENCES bed(bed_id)                    ON DELETE RESTRICT,
  FOREIGN KEY (request_id) REFERENCES allocation_request(request_id) ON DELETE SET NULL
);

-- ---------- 10. PAYMENT (one fee payment per allocation) ----------
CREATE TABLE payment (
  payment_id    INT PRIMARY KEY AUTO_INCREMENT,
  allocation_id INT NOT NULL UNIQUE,
  amount        INT NOT NULL CHECK (amount >= 0),     -- fee at the time of payment
  method        ENUM('UPI','Debit Card','Credit Card') NOT NULL,
  paid_on       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (allocation_id) REFERENCES allocation(allocation_id) ON DELETE RESTRICT
);

-- ---------- 11. COMPLAINT ----------
CREATE TABLE complaint (
  complaint_id       INT PRIMARY KEY AUTO_INCREMENT,
  student_id         INT NOT NULL,
  room_id            INT NOT NULL,
  assigned_staff_id  INT NULL,
  category           VARCHAR(30) NOT NULL,
  description        VARCHAR(255),
  priority           ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  status             ENUM('Reported','Assigned','In Progress','Resolved') NOT NULL DEFAULT 'Reported',
  reported_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at        DATETIME NULL,
  completion_remarks VARCHAR(255),
  FOREIGN KEY (student_id)        REFERENCES student(student_id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id)           REFERENCES room(room_id)       ON DELETE RESTRICT,
  FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id)     ON DELETE SET NULL
);

-- ---------- 12. COMPLAINT_HISTORY ----------
CREATE TABLE complaint_history (
  history_id   INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  old_status   VARCHAR(20) NULL,
  new_status   VARCHAR(20) NOT NULL,
  changed_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  remarks      VARCHAR(255),
  FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id) ON DELETE CASCADE
);

-- ---------- 13. NOTIFICATION ----------
CREATE TABLE notification (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL,
  message         VARCHAR(255) NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------- INDEXES ----------
CREATE INDEX idx_bed_status        ON bed(status);
CREATE INDEX idx_bed_room_status   ON bed(room_id, status);
CREATE INDEX idx_complaint_status  ON complaint(status, priority);
CREATE INDEX idx_request_status    ON allocation_request(status);
CREATE INDEX idx_request_bed       ON allocation_request(bed_id, status);

-- =====================================================================
-- TRIGGERS
-- =====================================================================
DELIMITER //

-- Free the bed automatically when an allocation ends
CREATE TRIGGER trg_free_bed
AFTER UPDATE ON allocation
FOR EACH ROW
BEGIN
  IF OLD.status = 'Active' AND NEW.status IN ('Vacated','Transferred') THEN
    UPDATE bed SET status = 'Available' WHERE bed_id = NEW.bed_id;
  END IF;
END//

-- First history row when a complaint is created
CREATE TRIGGER trg_complaint_created
AFTER INSERT ON complaint
FOR EACH ROW
BEGIN
  INSERT INTO complaint_history (complaint_id, old_status, new_status)
  VALUES (NEW.complaint_id, NULL, NEW.status);
END//

-- Stamp resolved_at automatically
CREATE TRIGGER trg_complaint_resolved_at
BEFORE UPDATE ON complaint
FOR EACH ROW
BEGIN
  IF NEW.status = 'Resolved' AND OLD.status <> 'Resolved' THEN
    SET NEW.resolved_at = NOW();
  END IF;
END//

-- Log every complaint status change. The application may put a note in the
-- session variable @note just before the UPDATE; it is stored with the entry.
CREATE TRIGGER trg_complaint_history
AFTER UPDATE ON complaint
FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO complaint_history (complaint_id, old_status, new_status, remarks)
    VALUES (NEW.complaint_id, OLD.status, NEW.status, @note);
  END IF;
END//

-- =====================================================================
-- STORED PROCEDURES  (the ONLY supported way to allocate / release beds)
-- Error messages (SQLSTATE 45000):
--   BED_NOT_FOUND, BED_NOT_AVAILABLE, STUDENT_ALREADY_ALLOCATED,
--   NO_ACTIVE_ALLOCATION, REQUEST_NOT_PENDING
-- =====================================================================

CREATE PROCEDURE allocate_bed(
  IN p_student_id INT,
  IN p_bed_id     INT,
  IN p_request_id INT          -- NULL for a direct (warden) allocation
)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_req_status VARCHAR(20);
  DECLARE v_active INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- lock the bed row: concurrent approvals for this bed now wait here
  SELECT status INTO v_status FROM bed WHERE bed_id = p_bed_id FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'BED_NOT_FOUND';
  END IF;
  IF v_status <> 'Available' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'BED_NOT_AVAILABLE';
  END IF;

  IF p_request_id IS NOT NULL THEN
    SELECT status INTO v_req_status FROM allocation_request
     WHERE request_id = p_request_id FOR UPDATE;
    IF v_req_status IS NULL OR v_req_status <> 'Pending' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'REQUEST_NOT_PENDING';
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_active FROM allocation
   WHERE student_id = p_student_id AND status = 'Active' FOR UPDATE;
  IF v_active > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'STUDENT_ALREADY_ALLOCATED';
  END IF;

  INSERT INTO allocation (student_id, bed_id, request_id, allocated_date)
  VALUES (p_student_id, p_bed_id, p_request_id, CURDATE());

  UPDATE bed SET status = 'Occupied' WHERE bed_id = p_bed_id;

  IF p_request_id IS NOT NULL THEN
    UPDATE allocation_request
       SET status = 'Allocated', resolved_at = NOW()
     WHERE request_id = p_request_id;
  END IF;

  -- other students who asked for this same bed lose it
  UPDATE allocation_request
     SET status = 'Rejected', remarks = 'Bed was allocated to another student', resolved_at = NOW()
   WHERE bed_id = p_bed_id AND status = 'Pending'
     AND (p_request_id IS NULL OR request_id <> p_request_id);

  -- this student's own other open request is no longer needed
  UPDATE allocation_request
     SET status = 'Rejected', remarks = 'Student already allocated', resolved_at = NOW()
   WHERE student_id = p_student_id AND status = 'Pending'
     AND (p_request_id IS NULL OR request_id <> p_request_id);

  COMMIT;
END//

CREATE PROCEDURE vacate_allocation(
  IN p_allocation_id INT,
  IN p_new_status    VARCHAR(20)      -- 'Vacated' or 'Transferred'
)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  SELECT status INTO v_status FROM allocation
   WHERE allocation_id = p_allocation_id FOR UPDATE;
  IF v_status IS NULL OR v_status <> 'Active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NO_ACTIVE_ALLOCATION';
  END IF;

  UPDATE allocation
     SET status = p_new_status, vacated_date = CURDATE()
   WHERE allocation_id = p_allocation_id;     -- trigger frees the bed
  COMMIT;
END//

CREATE PROCEDURE transfer_bed(
  IN p_student_id INT,
  IN p_new_bed_id INT
)
BEGIN
  DECLARE v_old_alloc INT;
  DECLARE v_status VARCHAR(20);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
  SELECT status INTO v_status FROM bed WHERE bed_id = p_new_bed_id FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'BED_NOT_FOUND';
  END IF;
  IF v_status <> 'Available' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'BED_NOT_AVAILABLE';
  END IF;

  SELECT allocation_id INTO v_old_alloc FROM allocation
   WHERE student_id = p_student_id AND status = 'Active' FOR UPDATE;
  IF v_old_alloc IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NO_ACTIVE_ALLOCATION';
  END IF;

  UPDATE allocation SET status = 'Transferred', vacated_date = CURDATE()
   WHERE allocation_id = v_old_alloc;          -- trigger frees the old bed

  INSERT INTO allocation (student_id, bed_id, allocated_date)
  VALUES (p_student_id, p_new_bed_id, CURDATE());
  UPDATE bed SET status = 'Occupied' WHERE bed_id = p_new_bed_id;
  COMMIT;
END//

DELIMITER ;

-- =====================================================================
-- VIEWS
-- =====================================================================
CREATE VIEW v_available_beds AS
SELECT b.bed_id, b.bed_no, r.room_id, r.room_no, r.floor_no, r.room_type,
       rt.capacity, bl.block_id, bl.block_name, bl.gender AS block_gender
FROM bed b
JOIN room r       ON r.room_id = b.room_id
JOIN room_type rt ON rt.room_type = r.room_type
JOIN block bl     ON bl.block_id = r.block_id
WHERE b.status = 'Available';

CREATE VIEW v_occupancy AS
SELECT COUNT(*)                                          AS total_beds,
       COALESCE(SUM(status = 'Occupied'), 0)             AS occupied_beds,
       COALESCE(SUM(status = 'Available'), 0)            AS available_beds,
       COALESCE(SUM(status = 'Under Maintenance'), 0)    AS maintenance_beds,
       ROUND(100 * COALESCE(SUM(status = 'Occupied'), 0) / NULLIF(COUNT(*), 0), 1) AS occupancy_percent
FROM bed;

CREATE VIEW v_pending_complaints AS
SELECT c.complaint_id, bl.block_name, r.room_no, c.category, c.priority,
       c.status, c.reported_at, c.assigned_staff_id
FROM complaint c
JOIN room r   ON r.room_id = c.room_id
JOIN block bl ON bl.block_id = r.block_id
WHERE c.status <> 'Resolved';

CREATE VIEW v_active_allocations AS
SELECT a.allocation_id, s.student_id, u.name AS student_name, s.department, s.year,
       bl.block_name, r.room_no, b.bed_no, a.allocated_date
FROM allocation a
JOIN student s ON s.student_id = a.student_id
JOIN users u   ON u.user_id = s.user_id
JOIN bed b     ON b.bed_id = a.bed_id
JOIN room r    ON r.room_id = b.room_id
JOIN block bl  ON bl.block_id = r.block_id
WHERE a.status = 'Active';
