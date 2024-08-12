import favoriteProperties from "../model/favoritePropertyModel.js";
import Property from "../model/propertyModel.js"; // Make sure to import your Property model
import path from 'path';

const BASE_URL = 'http://95.216.209.46:5500/uploads/';

export const createFavoriteProperty = async (req, res) => {
    try {
      const { userId, propertyId } = req.body;
  
      // Check if the property has already been viewed by this user
      const existingFavorite = await favoriteProperties.findOne({ userId, propertyId });
  
      if (existingFavorite) {
        // If it exists, update the createdAt timestamp
        existingFavorite.createdAt = new Date();
        await existingFavorite.save();
        res.status(200).send(existingFavorite);
      } else {
        // If it doesn't exist, create a new entry
        const favoriteProperty = new favoriteProperties(req.body);
        await favoriteProperty.save();
        res.status(201).send(favoriteProperty);
      }
    } catch (err) {
      res.status(400).send(err);
    }
  };

export const getFavoriteProperties = async (req, res) => {
  try {
    const userId = req.query.userId; // Assuming you're passing userId as a route parameter

    if (!userId) {
      return res.status(400).send({ error: 'User ID is required' });
    }

    const FavoriteProps = await favoriteProperties.find({ userId: userId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .populate({
        path: 'propertyId',
        model: Property,
        select: '-__v' // Exclude the __v field
      })
      .lean(); // Convert to plain JavaScript objects

    // Process the results to include the mainImage URL and format the data
    const formattedFavoriteProps = FavoriteProps.map(vp => {
      const property = vp.propertyId;
      return {
       
        property: {
          id: property?._id,
          title: property?.title,
          type: property?.type,
          category: property?.category,
          bedrooms: property?.bedrooms,
          bathrooms: property?.bathrooms,
          squareFeet: property?.squareFeet,
          price: property?.price,
          description: property?.description,
          features: property?.features,
          status: property?.status,
          rentNegotiable: property?.rentNegotiable,
          location: {
            address: property?.location.address,
            city: property?.location.city,
            state: property?.location.state,
            zip: property?.location.zip,
            country: property?.location.country,
            coordinates: property?.location.coordinates
          },
          mainImage: property?.mainImage ? `${BASE_URL}${path.basename(property.mainImage)}` : null,
          images:  (property?.images || []).map(image => `${BASE_URL}${path.basename(image)}`),
          furnishedType: property?.furnishedType,
          floorNumber: property?.floorNumber,
          parking: property?.parking,
          preferredTenant: property?.preferredTenant,
          nextAvailableDate: property?.nextAvailableDate,
          petFriendly: property?.petFriendly,
          gatedSociety: property?.gatedSociety,
          brokerage: property?.brokerage,
          createdAt: property?.createdAt,
          updatedAt: property?.updatedAt,
          viewedAt: vp.createdAt
        }
      };
    });

    res.send(formattedFavoriteProps);
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
};