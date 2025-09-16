import TeaQuality from "../models/TeaQuality.js";

// Create new tea quality
export async function createTeaQuality(req, res) {
  try {
    const qualityData = {
      quality_name: req.body.quality_name,
      description: req.body.description,
      price_per_kg: req.body.price_per_kg,
      min_weight: req.body.min_weight,
      max_weight: req.body.max_weight,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true
    };

    // Validation
    if (!qualityData.quality_name || !qualityData.price_per_kg) {
      return res.status(400).json({
        success: false,
        message: "Quality name and price per kg are required"
      });
    }

    const newQuality = await TeaQuality.create(qualityData);

    res.status(201).json({
      success: true,
      message: "Tea quality created successfully",
      data: newQuality
    });
  } catch (error) {
    console.error("Create tea quality error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get all tea qualities
export async function getAllTeaQualities(req, res) {
  try {
    const qualities = await TeaQuality.findAll();

    res.json({
      success: true,
      data: qualities,
      count: qualities.length
    });
  } catch (error) {
    console.error("Get all tea qualities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Get tea quality by ID
export async function getTeaQualityById(req, res) {
  try {
    const { id } = req.params;
    const quality = await TeaQuality.findById(id);

    if (!quality) {
      return res.status(404).json({
        success: false,
        message: "Tea quality not found"
      });
    }

    res.json({
      success: true,
      data: quality
    });
  } catch (error) {
    console.error("Get tea quality by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Update tea quality
export async function updateTeaQuality(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    const success = await TeaQuality.update(id, updateData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Tea quality not found"
      });
    }

    const updatedQuality = await TeaQuality.findById(id);

    res.json({
      success: true,
      message: "Tea quality updated successfully",
      data: updatedQuality
    });
  } catch (error) {
    console.error("Update tea quality error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}

// Delete tea quality (soft delete)
export async function deleteTeaQuality(req, res) {
  try {
    const { id } = req.params;
    const success = await TeaQuality.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Tea quality not found"
      });
    }

    res.json({
      success: true,
      message: "Tea quality deleted successfully"
    });
  } catch (error) {
    console.error("Delete tea quality error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}
