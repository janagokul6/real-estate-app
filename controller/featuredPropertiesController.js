import Property from '../model/propertyModel.js';

// export const createFeaturedProperty = async (req, res) => {
//   try {
//     const featuredProperty = new FeaturedProperties(req.body);
//     await featuredProperty.save();
//     res.status(201).send(featuredProperty);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };

export const getFeaturedProperties = async (req, res) => {
    try {
    //   const userId = req.query.userId; // Assuming you're passing userId as a route parameter
    // //   console.log(req.params)
    //   if (!userId) {
    //     return res.status(400).send({ error: 'User ID is required' });
    //   }
  
      const featuredProperties = await Property.find({ is_featured: 1 })
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .limit(10); // Limit to 10 most recent searches, adjust as needed
  
      res.send(featuredProperties);
    } catch (err) {
      res.status(500).send(err);
    }
  };