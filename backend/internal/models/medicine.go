package models

import "time"

type Medicine struct {
	BaseUUID

	Name                   string  `gorm:"type:varchar(255);not null;index" json:"name"`
	Code                   string  `gorm:"type:varchar(255);not null" json:"code"`
	DosageForm             string  `gorm:"type:varchar(50);not null" json:"dosage_form"` // tablet, capsule, syrup, injection, ointment
	Strength               *string `gorm:"type:varchar(100)" json:"strength"`            // 500 mg, 250 mg/5 ml
	Unit                   string  `gorm:"type:varchar(50);not null" json:"unit"`        // tablet, bottle, strip
	IsPrescriptionRequired bool    `gorm:"not null;default:false" json:"is_prescription_required"`
	Description            *string `gorm:"type:text" json:"description"`
	Status                 string  `gorm:"type:varchar(20);not null;default:'active'" json:"status"` // active, inactive
	Notes                  *string `gorm:"type:text" json:"notes"`

	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"deleted_at,omitempty"`
}

func (Medicine) TableName() string {
	return "medicines"
}
