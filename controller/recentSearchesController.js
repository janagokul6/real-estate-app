import RecentSearches from "../model/recentSearchesModel.js"

export const createRecentSearch = async (req, res) => {
  try {
    const { userId, searchText, latitude, longitude } = req.body;

    const updatedSearch = await RecentSearches.findOneAndUpdate(
      { userId, searchText },
      { 
        userId, 
        searchText, 
        latitude, 
        longitude,
        updatedAt: new Date()
      },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).send(updatedSearch);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getRecentSearches = async (req, res) => {
    try {
      const userId = req.query.userId; // Assuming you're passing userId as a route parameter
    //   console.log(req.params)
      if (!userId) {
        return res.status(400).send({ error: 'User ID is required' });
      }
  
      const recentSearches = await RecentSearches.find({ userId: userId })
        .sort({ updatedAt: -1 }) // Sort by creation date, newest first
        .limit(10); // Limit to 10 most recent searches, adjust as needed
  
      res.send(recentSearches);
    } catch (err) {
      res.status(500).send(err);
    }
  };