package mapper

import (
	"backend/internal/generated"
	"backend/internal/models"
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

func ToGeneratedPatientCheckup(c *models.PatientCheckup) generated.PatientCheckup {
	patientID, _ := uuid.Parse(c.PatientID)

	result := generated.PatientCheckup{
		Id:               openapi_types.UUID(c.ID),
		PatientId:        openapi_types.UUID(patientID),
		VisitDate:        c.VisitDate,
		Status:           generated.PatientCheckupStatus(c.Status),
		ChiefComplaint:   c.ChiefComplaint,
		Symptoms:         c.Symptoms,
		Diagnosis:        c.Diagnosis,
		BloodPressure:    c.BloodPressure,
		HeartRate:        c.HeartRate,
		RespiratoryRate:  c.RespiratoryRate,
		OxygenSaturation: c.OxygenSaturation,
		TreatmentPlan:    c.TreatmentPlan,
		Notes:            c.Notes,
		DoctorName:       c.DoctorName,
		CreatedAt:        c.CreatedAt,
		UpdatedAt:        c.UpdatedAt,
	}

	if c.TemperatureC != nil {
		v := float32(*c.TemperatureC)
		result.TemperatureC = &v
	}
	if c.HeightCm != nil {
		v := float32(*c.HeightCm)
		result.HeightCm = &v
	}
	if c.WeightKg != nil {
		v := float32(*c.WeightKg)
		result.WeightKg = &v
	}
	if c.FollowUpDate != nil {
		d := openapi_types.Date{Time: *c.FollowUpDate}
		result.FollowUpDate = &d
	}
	if len(c.Medicines) > 0 {
		medicines := ToGeneratedPatientCheckupMedicines(c.Medicines)
		result.Medicines = &medicines
	}

	return result
}

func ToGeneratedPatientCheckups(checkups []models.PatientCheckup) []generated.PatientCheckup {
	result := make([]generated.PatientCheckup, len(checkups))
	for i := range checkups {
		result[i] = ToGeneratedPatientCheckup(&checkups[i])
	}
	return result
}

func ToGeneratedPatientCheckupMedicine(m models.PatientCheckupMedicine) generated.PatientCheckupMedicine {
	medicineID, _ := uuid.Parse(m.MedicineID)
	return generated.PatientCheckupMedicine{
		MedicineId:   openapi_types.UUID(medicineID),
		MedicineName: m.MedicineName,
		Quantity:     m.Quantity,
		Dosage:       m.Dosage,
		Frequency:    m.Frequency,
		DurationDays: m.DurationDays,
		Notes:        m.Notes,
	}
}

func ToGeneratedPatientCheckupMedicines(medicines []models.PatientCheckupMedicine) []generated.PatientCheckupMedicine {
	result := make([]generated.PatientCheckupMedicine, len(medicines))
	for i := range medicines {
		result[i] = ToGeneratedPatientCheckupMedicine(medicines[i])
	}
	return result
}

func ToModelPatientCheckupMedicine(m generated.PatientCheckupMedicine) models.PatientCheckupMedicine {
	return models.PatientCheckupMedicine{
		MedicineID:   uuid.UUID(m.MedicineId).String(),
		MedicineName: m.MedicineName,
		Quantity:     m.Quantity,
		Dosage:       m.Dosage,
		Frequency:    m.Frequency,
		DurationDays: m.DurationDays,
		Notes:        m.Notes,
	}
}

func toModelPatientCheckupMedicines(medicines []generated.PatientCheckupMedicine) []models.PatientCheckupMedicine {
	result := make([]models.PatientCheckupMedicine, len(medicines))
	for i := range medicines {
		result[i] = ToModelPatientCheckupMedicine(medicines[i])
	}
	return result
}

func ToModelCreatePatientCheckup(req generated.CreatePatientCheckupRequest) *models.PatientCheckup {
	checkup := &models.PatientCheckup{
		PatientID:        uuid.UUID(req.PatientId).String(),
		VisitDate:        req.VisitDate,
		Status:           "scheduled",
		ChiefComplaint:   req.ChiefComplaint,
		Symptoms:         req.Symptoms,
		Diagnosis:        req.Diagnosis,
		BloodPressure:    req.BloodPressure,
		HeartRate:        req.HeartRate,
		RespiratoryRate:  req.RespiratoryRate,
		OxygenSaturation: req.OxygenSaturation,
		TreatmentPlan:    req.TreatmentPlan,
		Notes:            req.Notes,
		DoctorName:       req.DoctorName,
	}

	if req.Status != nil {
		checkup.Status = string(*req.Status)
	}
	if req.TemperatureC != nil {
		v := float64(*req.TemperatureC)
		checkup.TemperatureC = &v
	}
	if req.HeightCm != nil {
		v := float64(*req.HeightCm)
		checkup.HeightCm = &v
	}
	if req.WeightKg != nil {
		v := float64(*req.WeightKg)
		checkup.WeightKg = &v
	}
	if req.FollowUpDate != nil {
		t := req.FollowUpDate.Time
		checkup.FollowUpDate = &t
	}
	if req.Medicines != nil {
		checkup.Medicines = toModelPatientCheckupMedicines(*req.Medicines)
	}

	return checkup
}

func ToModelUpdatePatientCheckup(req generated.UpdatePatientCheckupRequest) *models.PatientCheckup {
	checkup := &models.PatientCheckup{
		VisitDate:        req.VisitDate,
		Status:           string(req.Status),
		ChiefComplaint:   req.ChiefComplaint,
		Symptoms:         req.Symptoms,
		Diagnosis:        req.Diagnosis,
		BloodPressure:    req.BloodPressure,
		HeartRate:        req.HeartRate,
		RespiratoryRate:  req.RespiratoryRate,
		OxygenSaturation: req.OxygenSaturation,
		TreatmentPlan:    req.TreatmentPlan,
		Notes:            req.Notes,
		DoctorName:       req.DoctorName,
	}

	if req.TemperatureC != nil {
		v := float64(*req.TemperatureC)
		checkup.TemperatureC = &v
	}
	if req.HeightCm != nil {
		v := float64(*req.HeightCm)
		checkup.HeightCm = &v
	}
	if req.WeightKg != nil {
		v := float64(*req.WeightKg)
		checkup.WeightKg = &v
	}
	if req.FollowUpDate != nil {
		t := req.FollowUpDate.Time
		checkup.FollowUpDate = &t
	}
	if req.Medicines != nil {
		checkup.Medicines = toModelPatientCheckupMedicines(*req.Medicines)
	}

	return checkup
}

func DatePtrToTimePtr(date *openapi_types.Date) *time.Time {
	if date == nil {
		return nil
	}
	t := date.Time
	return &t
}
