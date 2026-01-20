package models

import (
	"time"
)

type Patient struct {
	BaseUUID
	FullName              string     `gorm:"type:varchar(255);not null" json:"full_name"`
	DateOfBirth           string     `gorm:"type:date;not null" json:"date_of_birth"`
	Gender                string     `gorm:"type:varchar(20);not null" json:"gender"`       // male, female, other
	PatientType           string     `gorm:"type:varchar(50);not null" json:"patient_type"` // teacher, student, general
	PhoneNumber           string     `gorm:"type:varchar(20);not null" json:"phone_number"`
	Email                 *string    `gorm:"type:varchar(255)" json:"email"`
	Address               *string    `gorm:"type:text" json:"address"`
	MedicalRecordNumber   *string    `gorm:"type:varchar(100);uniqueIndex" json:"medical_record_number"`
	EmergencyContactName  *string    `gorm:"type:varchar(255)" json:"emergency_contact_name"`
	EmergencyContactPhone *string    `gorm:"type:varchar(20)" json:"emergency_contact_phone"`
	BloodType             *string    `gorm:"type:varchar(5)" json:"blood_type"` // A+, A-, B+, B-, AB+, AB-, O+, O-
	Allergies             *string    `gorm:"type:text" json:"allergies"`
	CreatedAt             time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt             *time.Time `gorm:"index" json:"deleted_at,omitempty"`
}

func (Patient) TableName() string {
	return "patients"
}
