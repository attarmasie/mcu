package models

import "time"

type MedicineStockActivity struct {
	BaseUUID

	MedicineID       string  `gorm:"type:uuid;not null;index" json:"medicine_id"`
	MedicineBatchID  *string `gorm:"type:uuid;index" json:"medicine_batch_id,omitempty"`
	PatientCheckupID *string `gorm:"type:uuid;index" json:"patient_checkup_id,omitempty"`

	ChangeType      string  `gorm:"type:varchar(20);not null" json:"change_type"`  // increase,decrease
	Source          string  `gorm:"type:varchar(30);not null;index" json:"source"` // admin,patient_checkup
	QuantityDelta   int     `gorm:"not null" json:"quantity_delta"`
	StockBefore     int     `gorm:"not null;check:stock_before >= 0" json:"stock_before"`
	StockAfter      int     `gorm:"not null;check:stock_after >= 0" json:"stock_after"`
	Notes           *string `gorm:"type:text" json:"notes,omitempty"`
	CreatedByUserID *string `gorm:"type:uuid;index" json:"created_by_user_id,omitempty"`

	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"deleted_at,omitempty"`
}

func (MedicineStockActivity) TableName() string {
	return "medicine_stock_activities"
}
