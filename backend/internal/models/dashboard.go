package models

import "time"

type DashboardStats struct {
	TotalPatients      int64                `json:"total_patients"`
	TotalMedicines     int64                `json:"total_medicines"`
	TotalCheckupsToday int64                `json:"total_checkups_today"`
	CheckupStatusToday CheckupStatusSummary `json:"checkup_status_today"`
	CheckupStatusWeek  CheckupStatusSummary `json:"checkup_status_week"`
	LowStockMedicines  []LowStockMedicine   `json:"low_stock_medicines"`
	RecentCheckups     []RecentCheckup      `json:"recent_checkups"`
	PatientTypeSummary []PatientTypeStat    `json:"patient_type_summary"`
	ExpiringBatches    []ExpiringBatch      `json:"expiring_batches"`
}

type LowStockMedicine struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Code         string `json:"code"`
	CurrentStock int    `json:"current_stock"`
	MinimumStock int    `json:"minimum_stock"`
}

type RecentCheckup struct {
	ID             string    `json:"id"`
	PatientName    string    `json:"patient_name"`
	ChiefComplaint string    `json:"chief_complaint"`
	Status         string    `json:"status"`
	VisitDate      time.Time `json:"visit_date"`
	DoctorName     *string   `json:"doctor_name"`
}

type CheckupStatusSummary struct {
	Scheduled int64 `json:"scheduled"`
	Completed int64 `json:"completed"`
	Cancelled int64 `json:"cancelled"`
}

type PatientTypeStat struct {
	PatientType string `json:"patient_type"`
	Count       int64  `json:"count"`
}

type ExpiringBatch struct {
	ID             string    `json:"id"`
	MedicineName   string    `json:"medicine_name"`
	BatchNumber    string    `json:"batch_number"`
	ExpirationDate time.Time `json:"expiration_date"`
	Quantity       int       `json:"quantity"`
}
