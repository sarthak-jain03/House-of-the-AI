import Visitor from "../models/visitor.model.js";
import VisitorCount from "../models/visitorCount.model.js";


export const trackVisitor = async (req, res) => {
  try {
    const visitorId = req.query.visitorId;

    
    if (!visitorId) {
      const current = await VisitorCount.findOne();
      return res.json({ success: true, count: current?.count ?? 0 });
    }

    
    const existing = await Visitor.findOne({ visitorId });
    if (existing) {
     
      const current = await VisitorCount.findOne();
      return res.json({ success: true, count: current?.count ?? 0 });
    }

    
    try {
      await Visitor.create({ visitorId });
    } catch (err) {

      if (err.code === 11000) {
        const current = await VisitorCount.findOne();
        return res.json({ success: true, count: current?.count ?? 0 });
      }
      throw err;
    }

    const counter = await VisitorCount.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    return res.json({ success: true, count: counter.count });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    return res.status(500).json({ success: false, count: 0 });
  }
};
