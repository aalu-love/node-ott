const { connection } = require("../config/db");

const addPlan = async (req, res) => {
  // add New plan to subscription_plans table
  try {
    const { name, price, duration_months } = req.body;
    const query =
      "INSERT INTO subscription_plans (name, price, duration_months) VALUES (?, ?, ?)";
    const values = [name, price, duration_months];
    await connection.query(query, values, (err) => {
      if (err) {
        console.error("Error in adding Plan:", err);
        res.status(500).json({ message: "Internal Server Error" });
      } else {
        res.status(200).json({ message: "Successfully added Plan " });
      }
    });
  } catch (error) {
    console.error("Error in addPlan:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const buyPlan = async (req, res) => {
  try {
    // Extract user ID from the request
    const { _id: user_id } = req.user;

    // Extract subscription plan ID from the request parameters
    const { plan_id: subscription_plans_id } = req.params;

    // Get the selected subscription plan from the database
    const selectPlan = "SELECT * FROM subscription_plans WHERE id = ?";
    const selectPlanValue = [subscription_plans_id];

    await connection.query(
      selectPlan,
      selectPlanValue,
      async (err, subscriptionResult) => {
        if (err) {
          // Handle database error
          console.error("Error in buyPlan:", err);
          res.status(500).json({ message: "Internal Server Error" });
        } else if (subscriptionResult.length > 0) {
          // Extract duration from the selected subscription plan
          const durationMonths = subscriptionResult[0].duration_months;

          // Get the user's currently active subscription, if any
          const selectActiveSubscription =
            "SELECT * FROM user_subscriptions WHERE user_id = ? AND isActive = 1";
          const selectActiveSubscriptionValues = [user_id];

          // Calculate the end date of the new subscription plan
          const planEndDate = new Date();
          planEndDate.setMonth(planEndDate.getMonth() + durationMonths);

          // Check if the user has an active subscription
          await connection.query(
            selectActiveSubscription,
            selectActiveSubscriptionValues,
            async (err, activeSubscription) => {
              if (err) {
                // Handle database error
                console.error("Error in buyPlan:", err);
                res.status(500).json({ message: "Internal Server Error" });
              } else if (activeSubscription.length > 0) {
                // If the user has an active subscription, insert a new inactive subscription
                const newInactiveSubscription =
                  "INSERT INTO user_subscriptions (user_id, subscription_plan_id, start_date, end_date, isActive) VALUES (?, ?, CURRENT_TIMESTAMP, ?, false)";
                const newInactiveSubscriptionValues = [
                  user_id,
                  subscription_plans_id,
                  planEndDate,
                ];

                await connection.query(
                  newInactiveSubscription,
                  newInactiveSubscriptionValues,
                  (err) => {
                    if (err) {
                      // Handle database error
                      console.error("Error in buyPlan:", err);
                      res
                        .status(500)
                        .json({ message: "Internal Server Error" });
                    } else {
                      // Respond with success
                      res.status(200).json({ message: "Successfully" });
                    }
                  }
                );
              } else {
                // If the user doesn't have an active subscription, insert a new active subscription
                const insertSubscription =
                  "INSERT INTO user_subscriptions (user_id, subscription_plan_id, start_date, end_date, isActive) VALUES (?, ?, CURRENT_TIMESTAMP, ?, true)";
                const insertSubscriptionValues = [
                  user_id,
                  subscription_plans_id,
                  planEndDate,
                ];

                await connection.query(
                  insertSubscription,
                  insertSubscriptionValues,
                  (err) => {
                    if (err) {
                      // Handle database error
                      console.error("Error in buyPlan:", err);
                      res
                        .status(500)
                        .json({ message: "Internal Server Error" });
                    } else {
                      // Respond with success
                      res.status(200).json({ message: "Successfully" });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    // Handle general error
    console.error("Error in buyPlan:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  addPlan,
  buyPlan,
};
