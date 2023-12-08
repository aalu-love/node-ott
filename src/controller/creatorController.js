const { connection } = require("../config/db");

const uploadContent = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { _id: creator_id } = req.user;
    const query =
      "INSERT INTO content (title, description, creator_id) VALUES (?,?,?)";
    const values = [title, description, creator_id];
    await connection.query(query, values, async (err) => {
      if (err) {
        console.error("Error in uploadContent:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
      return res.status(201).json({
        message: "Content uploaded successfully.",
      });
    });
  } catch (error) {
    console.error("Error in uploadContent:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const uploadVideo = async (req, res) => {
  try {
    const { content_id } = req.params;
    const { _id: user_id } = req.user;
    const { path } = req.file;
    const query = "INSERT INTO video_libary (video_url) VALUES (?)";
    const values = [path];
    await connection.query(query, values, async (err, result) => {
      if (err) {
        console.error("Error in uploadVideo:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result) {
        const contentVideoQuery =
          "INSERT INTO content_videos (user_id, content_id, video_id) VALUES (?, ?, ?)";
        const contentVideoValues = [user_id, content_id, result.insertId];
        await connection.query(
          contentVideoQuery,
          contentVideoValues,
          (err, result) => {
            if (err) {
              console.error("Error in uploadVideo:", err);
              return res.status(500).json({
                message: "Internal server error.",
              });
            } else if (result) {
              return res.status(201).json({
                message: "Video uploaded successfully.",
              });
            }
          }
        );
      }
    });
  } catch (error) {
    console.error("Error in uploadVideo:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const likeContent = async (req, res) => {
  try {
    const { content_id } = req.params;
    const { _id: user_id } = req.user;
    const checkLikeQuery =
      "SELECT * FROM content_likes WHERE user_id = ? AND content_id = ?";
    const checkLikeValues = [user_id, Number(content_id)];
    await connection.query(
      checkLikeQuery,
      checkLikeValues,
      async (err, result) => {
        if (err) {
          console.error("Error in likeContent:", err);
          return res.status(500).json({ message: "Internal server error." });
        } else if (result.length > 0) {
          return res.status(400).json({
            message: "You have already liked this content.",
          });
        } else {
          const query =
            "INSERT INTO content_likes (user_id, content_id) VALUES (?,?)";
          const values = [user_id, Number(content_id)];
          await connection.query(query, values, (err, result) => {
            if (err) {
              console.error("Error in likeContent:", err);
              return res
                .status(500)
                .json({ message: "Internal server error." });
            } else if (result) {
              return res.status(201).json({
                message: "Content liked successfully.",
              });
            }
          });
        }
      }
    );
  } catch (error) {
    console.error("Error in likeContent:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getContentDetails = async (req, res) => {
  try {
    const { content_id } = req.params;
    await connection.query(
      "UPDATE content SET viewer_count = viewer_count + 1 WHERE id = ?",
      [Number(content_id)],
      (err, result) => {
        if (err) {
          console.error("Error in getContentDetails:", err);
          return res.status(500).json({
            message: "Internal server error.",
          });
        }
      }
    );
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
  } catch (err) {
    console.error("Error in getContentDetails:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const commentContent = async (req, res) => {
  try {
    const { content_id } = req.params;
    const { _id: user_id } = req.user;
    const { comment, parent_id } = req.body;
    const query =
      "INSERT INTO content_comments (user_id, content_id, parent_id, comment) VALUES (?,?,?,?)";
    const values = [user_id, Number(content_id), parent_id || null, comment];
    await connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error in commentContent:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result) {
        return res.status(201).json({
          message: "Comment added successfully.",
        });
      }
    });
  } catch (error) {
    console.error("Error in commentContent:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const creatorCollaborator = async (req, res) => {
  try {
    const { content_id } = req.params;
    const { _id: user_id } = req.user;
    const { collaborator_id } = req.body;
    const query =
      "INSERT INTO creator_collaborations (creator_id, collaborator_id, content_id) VALUES (?,?,?)";
    const values = [user_id, Number(collaborator_id), Number(content_id)];
    await connection.query(query, values, (err, result) => {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "You have already added this collaborator.",
        });
      }
      if (err) {
        console.error("Error in creatorCollaborator:", err);
        return res.status(500).json({
          message: "Internal server error.",
        });
      } else if (result) {
        return res.status(201).json({
          message: "Collaborator added successfully.",
        });
      }
    });
  } catch (error) {
    console.error("Error in creatorCollaborator:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const rateProposal = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const { proposed_rate } = req.query;
    const query =
      "INSERT INTO rate_proposals (creator_id, proposed_rate) VALUES (?,?)";
    const values = [user_id, Number(proposed_rate)];
    await connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error in rateProposal:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result) {
        return res.status(201).json({
          message: "Proposal Created",
        });
      }
    });
  } catch (error) {
    console.error("Error in rateProposal:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateRate = async (req, res) => {
  try {
    const { _id: user_id } = req.user;
    const { status, proposal_id } = req.query;
    const query =
      "UPDATE rate_proposals SET status = ? WHERE id = ? AND creator_id = ?";
    const values = [status, Number(proposal_id), user_id];
    await connection.query(query, values, (err, result) => {
      if (err) {
        console.error("Error in updateRate:", err);
        return res.status(500).json({ message: "Internal server error." });
      } else if (result.affectedRows == 1) {
        return res.status(201).json({
          message: "Rate Updated",
        });
      } else {
        return res.status(404).json({ message: "Proposal not found." });
      }
    });
  } catch (error) {
    console.error("Error in updateRate:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getContentDetails,
  uploadContent,
  uploadVideo,
  likeContent,
  commentContent,
  creatorCollaborator,
  rateProposal,
  updateRate,
};
