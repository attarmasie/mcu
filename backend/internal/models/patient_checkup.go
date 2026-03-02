package models

import "time"

type PatientCheckupMedicine struct {
	MedicineID   string  `json:"medicine_id"`
	MedicineName string  `json:"medicine_name"`
	Quantity     int     `json:"quantity"`
	Dosage       string  `json:"dosage"`
	Frequency    string  `json:"frequency"`
	DurationDays int     `json:"duration_days"`
	Notes        *string `json:"notes,omitempty"`
}

type PatientCheckup struct {
	BaseUUID

	PatientID string  `gorm:"type:uuid;not null;index" json:"patient_id"`
	Patient   Patient `gorm:"foreignKey:PatientID" json:"patient"`

	VisitDate      time.Time `gorm:"not null;index" json:"visit_date"`
	Status         string    `gorm:"type:varchar(20);not null;default:'scheduled';index" json:"status"` // scheduled, completed, cancelled
	ChiefComplaint string    `gorm:"type:text;not null" json:"chief_complaint"`
	Symptoms       []string  `gorm:"type:jsonb;serializer:json;not null" json:"symptoms"`

	Diagnosis        *string                  `gorm:"type:text" json:"diagnosis,omitempty"`
	TemperatureC     *float64                 `gorm:"type:decimal(5,2)" json:"temperature_c,omitempty"`
	BloodPressure    *string                  `gorm:"type:varchar(20)" json:"blood_pressure,omitempty"`
	HeartRate        *int                     `gorm:"check:heart_rate >= 0" json:"heart_rate,omitempty"`
	RespiratoryRate  *int                     `gorm:"check:respiratory_rate >= 0" json:"respiratory_rate,omitempty"`
	OxygenSaturation *int                     `gorm:"check:oxygen_saturation >= 0 AND oxygen_saturation <= 100" json:"oxygen_saturation,omitempty"`
	HeightCm         *float64                 `gorm:"type:decimal(6,2);check:height_cm >= 0" json:"height_cm,omitempty"`
	WeightKg         *float64                 `gorm:"type:decimal(6,2);check:weight_kg >= 0" json:"weight_kg,omitempty"`
	Medicines        []PatientCheckupMedicine `gorm:"type:jsonb;serializer:json" json:"medicines,omitempty"`
	TreatmentPlan    *string                  `gorm:"type:text" json:"treatment_plan,omitempty"`
	Notes            *string                  `gorm:"type:text" json:"notes,omitempty"`
	DoctorName       *string                  `gorm:"type:varchar(255)" json:"doctor_name,omitempty"`
	FollowUpDate     *time.Time               `gorm:"type:date" json:"follow_up_date,omitempty"`

	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"deleted_at,omitempty"`
}

func (PatientCheckup) TableName() string {
	return "patient_checkups"
}
