import Property from '../model/propertyModel.js';

// Create a new property
export const createProperty = async (req, res) => {
    try {
      const location = req.body;

      
      
      const property = new Property(location);
      await property.save();
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

// Get all properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get properties near a location
export const getPropertiesNear = async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;
  try {
    const properties = await Property.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
