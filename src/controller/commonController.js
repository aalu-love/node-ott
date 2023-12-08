const { connection } = require("../config/db");

const getLikesCount = async (req, res) => {
  try {
    const { content_id } = req.params;
    const query =
      "SELECT COUNT(*) as likes_count FROM content_likes WHERE content_id = ?";
    const values = [Number(content_id)];
    await connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error in getLikesCount:", err);
        return res.status(500).json({
          message: "Internal server error.",
        });
      } else if (result.length === 0) {
        return res.status(404).json({ message: "Content not found." });
      } else {
        console.log(result);
        return res.status(200).json({
          message: "Content found successfully.",
          likesCount: result[0].likes_count,
        });
      }
    });
  } catch (error) {
    console.error("Error in getLikesCount:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getContentDetails = async (req, res) => {
  try {
    const { content_id } = req.params;
    const query = "SELECT * FROM content WHERE id = ?";
    const values = [Number(content_id)];
    await connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error in getContentDetails:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result.length === 0) {
        return res.status(404).json({ message: "Content not found." });
      } else {
        return res.status(200).json({
          message: "Content found successfully.",
          content: result[0],
        });
      }
    });
  } catch (error) {
    console.error("Error in getContentDetails:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getCommentArray = async (req, res) => {
  try {
    const { content_id } = req.params;
    const query = `
                SELECT
                  cc.id,
                  cc.comment,
                  u.username AS user_name,
                  cc.created_at,
                  cc.updated_at
                FROM content_comments cc
                JOIN users u ON cc.user_id = u.id
                WHERE cc.content_id = ?
                ORDER BY cc.created_at DESC
                `;
    const values = [Number(content_id)];
    await connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error in getCommentArray:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result.length === 0) {
        return res.status(404).json({ message: "Content not found." });
      } else {
        return res.status(200).json({
          comments: result,
        });
      }
    });
  } catch (error) {
    console.error("Error in getCommentArray:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getLikesCount,
  getContentDetails,
  getCommentArray,
};
