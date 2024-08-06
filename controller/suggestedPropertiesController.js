import Property from '../model/propertyModel.js';

// export const createSuggestedProperty = async (req, res) => {
//   try {
//     const suggestedProperty = new SuggestedProperties(req.body);
//     await suggestedProperty.save();
//     res.status(201).send(suggestedProperty);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };

export const getSuggestedProperties = async (req, res) => {
    try {
    //   const userId = req.query.userId; // Assuming you're passing userId as a route parameter
    // //   console.log(req.params)
    //   if (!userId) {
    //     return res.status(400).send({ error: 'User ID is required' });
    //   }
  
      const suggestedProperties = await Property.find()
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .limit(5); // Limit to 10 most recent searches, adjust as needed
  
      res.send(suggestedProperties);
    } catch (err) {
      res.status(500).send(err);
    }
  };