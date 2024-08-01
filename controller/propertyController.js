import Property from '../model/propertyModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/';
const BASE_URL = 'http://95.216.209.46:5500/uploads/';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const createProperty = async (req, res) => {
  try {
    const {
      title,
      type,
      bedrooms,
      bathrooms,
      squareFeet,
      price,
      description,
      features,
      status,
      location,
      agentId,
      furnishedType,
      floorNumber,
      parking,
      preferredTenant,
      nextAvailableDate,
      petFriendly,
      gatedSociety,
      brokerage,
      images = []
    } = req.body;

    let processedImages = [];

    // Handle images from file upload
    if (req.files && req.files.length > 0) {
      processedImages = req.files.map(file => {
        const imageFileName = `properties_${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const imagePath = path.join(uploadDir, imageFileName);
        
        // Move the file to the upload directory
        fs.renameSync(file.path, imagePath);

        return {
          filename: imageFileName,
          path: imagePath
        };
      });
    } else if (req.body.images && req.body.images.length > 0) {
      // Handle base64 encoded images
      processedImages = req.body.images.map((base64, index) => {
        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches.length !== 3) {
          throw new Error('Invalid base64 string');
        }

        const imageFileName = `properties_${Date.now()}-image_${index + 1}.${matches[1].split('/')[1]}`;
        const imagePath = path.join(uploadDir, imageFileName);
        
        fs.writeFileSync(imagePath, matches[2], 'base64');

        return {
          filename: imageFileName,
          path: imagePath
        };
      });
    }

    const newProperty = new Property({
      title,
      type,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      squareFeet: Number(squareFeet),
      price: Number(price),
      description,
      features: Array.isArray(features) ? features : JSON.parse(features || '[]'),
      status,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      agentId,
      images: processedImages.length > 0 ? processedImages.map(img => img.path) : [],
      mainImage: processedImages.length > 0 ? processedImages[0].path : null,
      furnishedType,
      floorNumber,
      parking,
      preferredTenant,
      nextAvailableDate,
      petFriendly,
      gatedSociety,
      brokerage
    });

    await newProperty.save();

    let message = 'Property created successfully';
    if (processedImages.length === 0) {
      message += ' without images';
    }

    res.status(201).json({
      message: message,
      property: {
        ...newProperty.toObject(),
        images: processedImages.map(img => ({
          filename: img.filename,
          path: img.path
        }))
      }
    });
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(400).json({ message: error.message });
  }
};
// Get all properties

export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();
    const propertiesWithFullImagePaths = properties.map(property => ({
      ...property.toObject(),
      images: property.images.map(image => `${BASE_URL}${path.basename(image)}`),
      mainImage: property.mainImage ? `${BASE_URL}${path.basename(property.mainImage)}` : null,
    }));
    res.status(200).json(propertiesWithFullImagePaths);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get properties near a location-------------------------------------->
// export const getPropertiesNear = async (req, res) => {
//   const {
//     longitude,
//     latitude,
//     maxDistance,
//     minPrice,
//     maxPrice,
//     propertyType,
//     minBedrooms,
//     maxBedrooms,
//     minBathrooms,
//     maxBathrooms,
//     minArea,
//     maxArea,
//   } = req.query;

//   try {
//     let locationQuery = {};
//     let baseQuery = [];

//     // Add location filter
//     if (longitude && latitude && maxDistance) {
//       locationQuery.location = {
//         $near: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [parseFloat(longitude), parseFloat(latitude)]
//           },
//           $maxDistance: parseInt(maxDistance)
//         }
//       };
//     }

//     // Add price range filter
//     let priceQuery = {};
//     if (minPrice || maxPrice) {
//       priceQuery.price = {};
//       if (minPrice) priceQuery.price.$gte = parseFloat(minPrice);
//       if (maxPrice) priceQuery.price.$lte = parseFloat(maxPrice);
//       baseQuery.push(priceQuery);
//     }

//     // Add property type filter
//     if (propertyType) {
//       baseQuery.push({ type: propertyType });
//     }

//     // Add bedrooms filter
//     let bedroomsQuery = {};
//     if (minBedrooms || maxBedrooms) {
//       bedroomsQuery.bedrooms = {};
//       if (minBedrooms) bedroomsQuery.bedrooms.$gte = parseInt(minBedrooms);
//       if (maxBedrooms) bedroomsQuery.bedrooms.$lte = parseInt(maxBedrooms);
//       baseQuery.push(bedroomsQuery);
//     }

//     // Add bathrooms filter
//     let bathroomsQuery = {};
//     if (minBathrooms || maxBathrooms) {
//       bathroomsQuery.bathrooms = {};
//       if (minBathrooms) bathroomsQuery.bathrooms.$gte = parseFloat(minBathrooms);
//       if (maxBathrooms) bathroomsQuery.bathrooms.$lte = parseFloat(maxBathrooms);
//       baseQuery.push(bathroomsQuery);
//     }

//     // Add area filter
//     let areaQuery = {};
//     if (minArea || maxArea) {
//       areaQuery.squareFeet = {};
//       if (minArea) areaQuery.squareFeet.$gte = parseFloat(minArea);
//       if (maxArea) areaQuery.squareFeet.$lte = parseFloat(maxArea);
//       baseQuery.push(areaQuery);
//     }

//     // Combine base queries with $or
//     let query = baseQuery.length > 0 ? { $or: baseQuery } : {};

//     // First, query for properties within the location range
//     let properties = [];
//     if (Object.keys(locationQuery).length > 0) {
//       properties = await Property.find({ ...locationQuery, ...query });

//       // If properties found in location range, return them
//       if (properties.length > 0) {
//         return res.status(200).json(properties);
//       }
//     }

//     // If no properties in location range, query without location filter
//     if (baseQuery.length > 0) {
//       properties = await Property.find(query);
//     }

//     if (properties.length > 0) {
//       res.status(200).json({
//         message: "No properties found within the specified location range, but properties matching other criteria are available.",
//         properties: properties
//       });
//     } else {
//       res.status(200).json({
//         message: "No properties found within the specified location range and no properties match the other criteria."
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const getPropertiesNear = async (req, res) => {
  const {
    longitude,
    latitude,
    maxDistance,
    minPrice,
    maxPrice,
    propertyType,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    minArea,
    maxArea,
  } = req.query;

  try {
    let locationQuery = {};
    let baseQuery = [];

    // Add location filter
    if (longitude && latitude && maxDistance) {
      locationQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }

    // Add price range filter
    let priceQuery = {};
    if (minPrice || maxPrice) {
      priceQuery.price = {};
      if (minPrice) priceQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) priceQuery.price.$lte = parseFloat(maxPrice);
      baseQuery.push(priceQuery);
    }

    // Add property type filter
    if (propertyType) {
      const propertyTypes = propertyType.split(',');
      baseQuery.push({ type: { $in: propertyTypes } });
    }

    // Add bedrooms filter
    let bedroomsQuery = {};
    if (minBedrooms || maxBedrooms) {
      bedroomsQuery.bedrooms = {};
      if (minBedrooms) bedroomsQuery.bedrooms.$gte = parseInt(minBedrooms);
      if (maxBedrooms) bedroomsQuery.bedrooms.$lte = parseInt(maxBedrooms);
      baseQuery.push(bedroomsQuery);
    }

    // Add bathrooms filter
    let bathroomsQuery = {};
    if (minBathrooms || maxBathrooms) {
      bathroomsQuery.bathrooms = {};
      if (minBathrooms) bathroomsQuery.bathrooms.$gte = parseFloat(minBathrooms);
      if (maxBathrooms) bathroomsQuery.bathrooms.$lte = parseFloat(maxBathrooms);
      baseQuery.push(bathroomsQuery);
    }

    // Add area filter
    let areaQuery = {};
    if (minArea || maxArea) {
      areaQuery.squareFeet = {};
      if (minArea) areaQuery.squareFeet.$gte = parseFloat(minArea);
      if (maxArea) areaQuery.squareFeet.$lte = parseFloat(maxArea);
      baseQuery.push(areaQuery);
    }

    // Combine base queries with $and
    let query = baseQuery.length > 0 ? { $and: baseQuery } : {};

    // First, query for properties within the location range
    let properties = [];
    if (Object.keys(locationQuery).length > 0) {
      properties = await Property.find({ ...locationQuery, ...query });

      // If properties found in location range, return them
      if (properties.length > 0) {
        return res.status(200).json(properties);
      }
    }

    // If no properties in location range, query without location filter
    if (baseQuery.length > 0) {
      properties = await Property.find(query);
    }

    if (properties.length > 0) {
      res.status(200).json({
        message: "No properties found within the specified location range, but properties matching other criteria are available.",
        properties: properties
      });
    } else {
      res.status(200).json({
        message: "No properties found within the specified location range and no properties match the other criteria."
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a property by ID------------------------------------------->
export const updateProperty = async (req, res) => {
  try {
    const {
      title,
      type,
      bedrooms,
      bathrooms,
      squareFeet,
      price,
      description,
      features,
      status,
      location,
      agentId,
      images = [],
      furnishedType,
      floorNumber,
      parking,
      preferredTenant,
      nextAvailableDate,
      petFriendly,
      gatedSociety,
      brokerage
  } = req.body;

    let processedImages = [];

    // Handle new images from file upload
    if (req.files && req.files.length > 0) {
      processedImages = req.files.map(file => {
        const imageFileName = `properties_${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const imagePath = path.join(uploadDir, imageFileName);

        // Move the file to the upload directory
        fs.renameSync(file.path, imagePath);

        return {
          filename: imageFileName,
          path: imagePath
        };
      });
    }

    // Handle base64 encoded images
    if (images.length > 0) {
      processedImages = processedImages.concat(images.map((base64, index) => {
        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (matches.length !== 3) {
          throw new Error('Invalid base64 string');
        }

        const imageFileName = `properties_${Date.now()}-image_${index + 1}.${matches[1].split('/')[1]}`;
        const imagePath = path.join(uploadDir, imageFileName);

        fs.writeFileSync(imagePath, matches[2], 'base64');

        return {
          filename: imageFileName,
          path: imagePath
        };
      }));  
    }

    // Find and update the property
    const updatedProperty = await Property.findByIdAndUpdate(id, {
      title,
      type,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      squareFeet: Number(squareFeet),
      price: Number(price),
      description,
      features: Array.isArray(features) ? features : JSON.parse(features || '[]'),
      status,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      agentId,
      images: processedImages.length > 0 ? processedImages.map(img => img.path) : undefined,
      mainImage: processedImages.length > 0 ? processedImages[0].path : undefined,
      furnishedType,
      floorNumber,
      parking,
      preferredTenant,
      nextAvailableDate,
      petFriendly,
      gatedSociety,
      brokerage,
      updatedAt: Date.now()
    }, { new: true });

    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      message: 'Property updated successfully',
      property: {
        ...updatedProperty.toObject(),
        images: processedImages.map(img => ({
          filename: img.filename,
          path: img.path
        }))
      }
    });
  } catch (error) {
    console.error('Error in updateProperty:', error);
    res.status(400).json({ message: error.message });
  }
};


// Delete a property by ID----------------------------------->
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the property
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete associated images from the file system
    if (property.images && property.images.length > 0) {
      property.images.forEach(imagePath => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    // Delete the property from the database
    await Property.findByIdAndDelete(id);

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------->>>>>>>>>>>>
export const getPropertiesByAgent = async (req, res) => {
  const { agentId } = req.params; // Extract agentId from request parameters

  try {
    // Find properties by agentId
    const properties = await Property.find({ agentId });

    // Map through properties to include full image paths
    const propertiesWithFullImagePaths = properties.map(property => ({
      ...property.toObject(),
      images: property.images.map(image => `${BASE_URL}${path.basename(image)}`),
      mainImage: property.mainImage ? `${BASE_URL}${path.basename(property.mainImage)}` : null,
    }));

    if (propertiesWithFullImagePaths.length === 0) {
      return res.status(404).json({ message: 'No properties found for this agent' });
    }

    res.status(200).json(propertiesWithFullImagePaths);
  } catch (error) {
    console.error('Error in getPropertiesByAgent:', error);
    res.status(500).json({ message: error.message });
  }
};

