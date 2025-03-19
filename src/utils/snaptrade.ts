/**
 * Functions for interacting with the SnapTrade API
 */
import { snaptrade } from "./snaptrade-sdk";
import { createClient } from "@/supabase/client";

/**
 * Check if SnapTrade credentials are configured
 * @returns Boolean indicating if credentials are set
 */
export function areSnapTradeCredentialsConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID &&
    !!process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY
  );
}

/**
 * Check the status of the SnapTrade API
 */
export async function checkSnapTradeStatus() {
  if (!snaptrade) {
    throw new Error("SnapTrade SDK not initialized");
  }

  try {
    const response = await snaptrade.apiStatus.check();
    return {
      status: "ok",
      data: response.data,
      credentialsConfigured: true,
    };
  } catch (error) {
    console.error("Error checking SnapTrade status:", error);
    throw error;
  }
}

/**
 * Register a new SnapTrade user
 * @param userId The user ID to register with SnapTrade
 */
export async function registerSnapTradeUser(userId: string) {
  if (!snaptrade) {
    throw new Error("SnapTrade SDK not initialized");
  }

  try {
    const response = await snaptrade.authentication.registerSnapTradeUser({
      userId: userId,
    });

    if (!response.data) {
      throw new Error("Failed to register user with SnapTrade");
    }

    // Store the user secret in the database
    const supabase = createClient();
    const { error: dbError } = await supabase.from("broker_connections").upsert(
      {
        user_id: userId,
        broker_id: "snaptrade",
        api_key: "snaptrade_user",
        api_secret_encrypted: response.data.userSecret,
        is_active: true,
        broker_data: {
          registered_at: new Date().toISOString(),
          snap_trade_user_id: response.data.userId,
        },
      },
      { onConflict: "user_id,broker_id", ignoreDuplicates: false },
    );

    if (dbError) {
      console.error("Error storing SnapTrade user secret:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return response.data;
  } catch (error: any) {
    // If the user already exists, try to handle it gracefully
    if (
      (error.response?.status === 400 || error.status === 400) &&
      (error.response?.data?.detail?.includes(
        "User with the following userId already exist",
      ) ||
        error.responseBody?.detail?.includes(
          "User with the following userId already exist",
        ))
    ) {
      console.log(
        "User already registered with SnapTrade, creating new connection",
      );

      // Create a new entry in the broker_connections table
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("broker_connections")
        .upsert(
          {
            user_id: userId,
            broker_id: "snaptrade",
            api_key: "snaptrade_user",
            api_secret_encrypted: error.responseBody?.userSecret || "",
            is_active: true,
            broker_data: {
              registered_at: new Date().toISOString(),
              snap_trade_user_id: userId,
            },
          },
          { onConflict: "user_id,broker_id", ignoreDuplicates: false },
        );

      if (dbError) {
        console.error("Error creating SnapTrade connection:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Try to get the user secret from the API directly
      try {
        // Make a direct call to get the user secret
        // First check if we have a userSecret in the error response
        const userSecret =
          error.responseBody?.userSecret || error.response?.data?.userSecret;

        // If we don't have a user secret, try a different approach
        if (!userSecret) {
          console.log(
            "No user secret found in error response, trying to login directly",
          );

          try {
            // Try to get user details first instead of direct login
            const userResponse = await snaptrade.authentication.getUserDetails({
              userId: userId,
            });

            if (userResponse.data?.userSecret) {
              // Update the database with the retrieved user secret
              await supabase
                .from("broker_connections")
                .update({
                  api_secret_encrypted: userResponse.data.userSecret,
                  broker_data: {
                    registered_at: new Date().toISOString(),
                    snap_trade_user_id: userId,
                  },
                })
                .eq("user_id", userId)
                .eq("broker_id", "snaptrade");

              return { userId, userSecret: userResponse.data.userSecret };
            }
          } catch (loginError) {
            console.log(`Error getting user details: ${loginError}`);
          }

          // If direct login fails, try delete and recreate
          try {
            console.log("Attempting to delete and recreate user");
            // Try to delete the existing user
            await snaptrade.authentication.deleteSnapTradeUser({
              userId: userId,
            });
            console.log(`Successfully deleted user ${userId}`);
          } catch (deleteError) {
            console.log(`Error deleting user: ${deleteError}`);
          }

          // Now register the user again with the same ID
          const newRegistration =
            await snaptrade.authentication.registerSnapTradeUser({
              userId: userId,
            });

          if (newRegistration.data && newRegistration.data.userSecret) {
            // Update the database with the new user secret
            await supabase
              .from("broker_connections")
              .update({
                api_secret_encrypted: newRegistration.data.userSecret,
                broker_data: {
                  registered_at: new Date().toISOString(),
                  snap_trade_user_id: newRegistration.data.userId,
                },
              })
              .eq("user_id", userId)
              .eq("broker_id", "snaptrade");

            return newRegistration.data;
          }

          throw new Error("Failed to recreate user and get user secret");
        }

        const response = await snaptrade.authentication.loginSnapTradeUser({
          userId: userId,
          userSecret: userSecret,
          immediateRedirect: false,
        });

        if (response.data?.userSecret) {
          // Update the secret in the database
          await supabase
            .from("broker_connections")
            .update({
              api_secret_encrypted: response.data.userSecret,
            })
            .eq("user_id", userId)
            .eq("broker_id", "snaptrade");

          return { userId, userSecret: response.data.userSecret };
        }

        // If we can't get the user secret from the API, delete the existing user and create a new one
        console.log(`Deleting and recreating user with ID: ${userId}`);
        try {
          // First try to delete the existing user
          await snaptrade.authentication.deleteSnapTradeUser({
            userId: userId,
          });
          console.log(`Successfully deleted user ${userId}`);
        } catch (deleteError) {
          console.log(
            `Error deleting user, will try to register anyway: ${deleteError}`,
          );
        }

        // Now register the user again with the same ID
        const newResponse =
          await snaptrade.authentication.registerSnapTradeUser({
            userId: userId,
          });

        if (newResponse.data) {
          // Update the database with the new user ID
          await supabase
            .from("broker_connections")
            .update({
              api_secret_encrypted: newResponse.data.userSecret,
              broker_data: {
                registered_at: new Date().toISOString(),
                snap_trade_user_id: newResponse.data.userId,
              },
            })
            .eq("user_id", userId)
            .eq("broker_id", "snaptrade");

          return newResponse.data;
        }
      } catch (apiError) {
        console.error("Error retrieving user secret from API:", apiError);
      }
    }

    console.error("Error registering SnapTrade user:", error);
    throw error;
  }
}

/**
 * Get the user secret for a SnapTrade user
 * @param userId The user ID to get the secret for
 */
export async function getUserSecret(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("broker_connections")
    .select("api_secret_encrypted")
    .eq("user_id", userId)
    .eq("broker_id", "snaptrade")
    .maybeSingle();

  if (error) {
    console.error("Error getting user secret:", error);
    throw new Error("Database error when retrieving user secret");
  }

  if (!data) {
    console.log("No SnapTrade connection found for user", userId);
    throw new Error("User not registered with SnapTrade");
  }

  return data.api_secret_encrypted;
}

/**
 * Generate a connection portal URL for a SnapTrade user
 * @param userId The user ID to generate the URL for
 * @param redirectUri The URI to redirect to after connection
 * @param brokerId Optional broker ID to pre-select
 */
export async function createSnapTradeUserLink(
  userId: string,
  redirectUri: string,
  brokerId?: string,
) {
  if (!snaptrade) {
    throw new Error("SnapTrade SDK not initialized");
  }

  try {
    // First, check if the user is registered with SnapTrade
    try {
      // Get the user secret from the database
      const userSecret = await getUserSecret(userId);

      // Generate connection portal URL
      const response = await snaptrade.authentication.loginSnapTradeUser({
        userId: userId,
        userSecret: userSecret,
        broker: brokerId || undefined,
        immediateRedirect: false, // Changed to false to better handle errors
        customRedirect: redirectUri,
        connectionPortalVersion: "v4",
      });

      if (!response.data || !response.data.redirectURI) {
        throw new Error("Failed to generate connection portal URL");
      }

      // Update the connection attempt in the database
      const supabase = createClient();
      await supabase
        .from("broker_connections")
        .update({
          broker_data: {
            connection_started: new Date().toISOString(),
            broker_id: brokerId || "any",
          },
        })
        .eq("user_id", userId)
        .eq("broker_id", "snaptrade");

      return response.data.redirectURI;
    } catch (secretError) {
      // If user secret not found, try to register the user first
      if (secretError.message === "User not registered with SnapTrade") {
        console.log("User not registered with SnapTrade, registering now...");
        try {
          const registrationResult = await registerSnapTradeUser(userId);
          console.log("Registration result:", registrationResult);
          // Try again after registration
          return createSnapTradeUserLink(userId, redirectUri, brokerId);
        } catch (regError) {
          console.error("Error during user registration:", regError);

          // If the user already exists but we couldn't get the secret, try to delete and recreate
          if (regError.response?.status === 400 || regError.status === 400) {
            try {
              // Try to delete the existing user
              await snaptrade.authentication.deleteSnapTradeUser({
                userId: userId,
              });
              console.log(`Successfully deleted user ${userId}`);

              // Now register the user again with the same ID
              const newRegistration =
                await snaptrade.authentication.registerSnapTradeUser({
                  userId: userId,
                });

              if (newRegistration.data && newRegistration.data.userSecret) {
                // Update the database with the new user secret
                const supabase = createClient();
                await supabase.from("broker_connections").upsert(
                  {
                    user_id: userId,
                    broker_id: "snaptrade",
                    api_key: "snaptrade_user",
                    api_secret_encrypted: newRegistration.data.userSecret,
                    is_active: true,
                    broker_data: {
                      registered_at: new Date().toISOString(),
                      snap_trade_user_id: newRegistration.data.userId,
                    },
                  },
                  { onConflict: "user_id,broker_id", ignoreDuplicates: false },
                );

                // Try again after recreation
                return createSnapTradeUserLink(userId, redirectUri, brokerId);
              }
            } catch (recreateError) {
              console.error("Error recreating user:", recreateError);
            }
          }

          throw new Error(
            `Failed to register user: ${regError.message || "Unknown error"}`,
          );
        }
      }
      console.error("Error in createSnapTradeUserLink:", secretError);
      throw secretError;
    }
  } catch (error) {
    console.error("Error creating SnapTrade connection:", error);

    // Provide more detailed error information
    const errorDetails =
      error.response?.data?.detail ||
      error.responseBody?.detail ||
      (error.response?.data ? JSON.stringify(error.response.data) : null) ||
      error.message ||
      "Unknown error";

    throw new Error(`Failed to link account: ${errorDetails}`);
  }
}

/**
 * Fetch accounts for a SnapTrade user
 * @param userId The user ID to fetch accounts for
 */
export async function fetchSnapTradeAccounts(userId: string) {
  if (!snaptrade) {
    throw new Error("SnapTrade SDK not initialized");
  }

  try {
    // Get the user secret from the database
    const userSecret = await getUserSecret(userId);

    // Get all accounts for the user
    const response = await snaptrade.accountInformation.listUserAccounts({
      userId: userId,
      userSecret: userSecret,
    });

    if (!response.data) {
      throw new Error("Failed to fetch accounts");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching SnapTrade accounts:", error);
    throw error;
  }
}

/**
 * Fetch holdings for a SnapTrade user
 * @param userId The user ID to fetch holdings for
 * @param accountId Optional account ID to filter by
 */
export async function fetchSnapTradeHoldings(
  userId: string,
  accountId?: string,
) {
  if (!snaptrade) {
    throw new Error("SnapTrade SDK not initialized");
  }

  try {
    // Get the user secret from the database
    const userSecret = await getUserSecret(userId);

    let holdings = [];

    if (accountId) {
      // Get positions for a specific account
      const positionsResponse =
        await snaptrade.accountInformation.getUserAccountPositions({
          userId: userId,
          userSecret: userSecret,
          accountId: accountId,
        });

      if (!positionsResponse.data) {
        throw new Error("Failed to fetch positions");
      }

      // Get account details
      const accountsResponse =
        await snaptrade.accountInformation.listUserAccounts({
          userId: userId,
          userSecret: userSecret,
        });

      const account = accountsResponse.data?.find(
        (acc) => acc.id === accountId,
      );

      // Process positions
      holdings = positionsResponse.data.map((position) => {
        const quantity = parseFloat(position.quantity || "0");
        const price = parseFloat(position.price || "0");
        const bookValue = parseFloat(position.bookValue || "0");
        const totalValue = quantity * price;

        return {
          symbol: position.symbol.symbol || position.symbol,
          name:
            position.symbol.description ||
            position.symbol.symbol ||
            position.symbol,
          quantity: quantity,
          pricePerShare: price,
          totalValue: totalValue,
          gainLoss: totalValue - bookValue,
          purchasePrice: bookValue / quantity,
          accountId: accountId,
          accountName: account?.name || "Investment Account",
          brokerName: account?.brokerage?.name || "SnapTrade",
          currency: position.currency || "USD",
        };
      });

      // Get balances for the account
      const balancesResponse =
        await snaptrade.accountInformation.getUserAccountBalance({
          userId: userId,
          userSecret: userSecret,
          accountId: accountId,
        });

      // Add cash balances
      if (balancesResponse.data) {
        for (const balance of balancesResponse.data) {
          if (balance.cash && parseFloat(balance.amount) > 0) {
            holdings.push({
              symbol: "CASH",
              name: `Cash (${balance.currency})`,
              quantity: 1,
              pricePerShare: parseFloat(balance.amount),
              totalValue: parseFloat(balance.amount),
              gainLoss: 0,
              purchasePrice: parseFloat(balance.amount),
              accountId: accountId,
              accountName: account?.name || "Investment Account",
              brokerName: account?.brokerage?.name || "SnapTrade",
              currency: balance.currency || "USD",
            });
          }
        }
      }
    } else {
      // Get all accounts for the user
      const accountsResponse =
        await snaptrade.accountInformation.listUserAccounts({
          userId: userId,
          userSecret: userSecret,
        });

      if (!accountsResponse.data) {
        throw new Error("Failed to fetch accounts");
      }

      // For each account, get the positions and balances
      for (const account of accountsResponse.data) {
        // Get positions for the account
        const positionsResponse =
          await snaptrade.accountInformation.getUserAccountPositions({
            userId: userId,
            userSecret: userSecret,
            accountId: account.id,
          });

        if (positionsResponse.data) {
          // Process positions
          const accountHoldings = positionsResponse.data.map((position) => {
            const quantity = parseFloat(position.quantity || "0");
            const price = parseFloat(position.price || "0");
            const bookValue = parseFloat(position.bookValue || "0");
            const totalValue = quantity * price;

            return {
              symbol: position.symbol.symbol || position.symbol,
              name:
                position.symbol.description ||
                position.symbol.symbol ||
                position.symbol,
              quantity: quantity,
              pricePerShare: price,
              totalValue: totalValue,
              gainLoss: totalValue - bookValue,
              purchasePrice: bookValue / quantity,
              accountId: account.id,
              accountName: account.name || "Investment Account",
              brokerName: account.brokerage?.name || "SnapTrade",
              currency: position.currency || "USD",
            };
          });

          holdings = [...holdings, ...accountHoldings];
        }

        // Get balances for the account
        const balancesResponse =
          await snaptrade.accountInformation.getUserAccountBalance({
            userId: userId,
            userSecret: userSecret,
            accountId: account.id,
          });

        // Add cash balances
        if (balancesResponse.data) {
          for (const balance of balancesResponse.data) {
            if (balance.cash && parseFloat(balance.amount) > 0) {
              holdings.push({
                symbol: "CASH",
                name: `Cash (${balance.currency})`,
                quantity: 1,
                pricePerShare: parseFloat(balance.amount),
                totalValue: parseFloat(balance.amount),
                gainLoss: 0,
                purchasePrice: parseFloat(balance.amount),
                accountId: account.id,
                accountName: account.name || "Investment Account",
                brokerName: account.brokerage?.name || "SnapTrade",
                currency: balance.currency || "USD",
              });
            }
          }
        }
      }
    }

    return holdings;
  } catch (error) {
    console.error("Error fetching SnapTrade holdings:", error);
    throw error;
  }
}

/**
 * Handle SnapTrade callback
 * @param userId The user ID for the callback
 * @param authorizationId The authorization ID from the callback
 * @param brokerage The brokerage name from the callback
 */
export async function handleSnapTradeCallback(
  userId: string,
  authorizationId: string,
  brokerage: string,
) {
  if (!snaptrade) {
    throw new Error("SnapTrade SDK not initialized");
  }

  try {
    // Get the user secret from the database
    const userSecret = await getUserSecret(userId);

    // Update the connection in the database
    const supabase = createClient();

    // First get the existing broker_data to preserve any fields
    const { data: existingData } = await supabase
      .from("broker_connections")
      .select("broker_data")
      .eq("user_id", userId)
      .eq("broker_id", "snaptrade")
      .maybeSingle();

    const existingBrokerData = existingData?.broker_data || {};

    await supabase
      .from("broker_connections")
      .update({
        is_active: true,
        broker_data: {
          ...existingBrokerData,
          connected_at: new Date().toISOString(),
          brokerage: brokerage || existingBrokerData.brokerage || null,
          authorization_id:
            authorizationId || existingBrokerData.authorization_id || null,
        },
      })
      .eq("user_id", userId)
      .eq("broker_id", "snaptrade");

    // Get all accounts for the user
    const accountsResponse =
      await snaptrade.accountInformation.listUserAccounts({
        userId: userId,
        userSecret: userSecret,
      });

    if (!accountsResponse.data) {
      throw new Error("Failed to fetch accounts");
    }

    // Get category ID for investments
    const { data: categoryData, error: categoryError } = await supabase
      .from("asset_categories")
      .select("id")
      .eq("slug", "investments")
      .single();

    if (categoryError) {
      console.error("Error getting investment category:", categoryError);
      throw new Error(`Category error: ${categoryError.message}`);
    }

    if (!categoryData) {
      console.error("Investment category not found");
      throw new Error("Category not found");
    }

    // For each account, get the positions and balances
    for (const account of accountsResponse.data) {
      // Get positions for the account
      const positionsResponse =
        await snaptrade.accountInformation.getUserAccountPositions({
          userId: userId,
          userSecret: userSecret,
          accountId: account.id,
        });

      if (positionsResponse.data) {
        // Process each position
        for (const position of positionsResponse.data) {
          if (!position.symbol) continue;

          // Calculate values
          const quantity = parseFloat(position.quantity || "0");
          const price = parseFloat(position.price || "0");
          const bookValue = parseFloat(position.bookValue || "0");
          const totalValue = quantity * price;

          // Insert the position as an asset
          const { error: insertError } = await supabase.from("assets").insert({
            name: position.symbol.symbol || position.symbol,
            value: totalValue,
            description: `${quantity} shares of ${position.symbol.symbol || position.symbol}`,
            location: account.name || "SnapTrade",
            acquisition_date: new Date().toISOString(),
            acquisition_value: bookValue || totalValue,
            category_id: categoryData.id,
            is_liability: false,
            user_id: userId,
            metadata: {
              symbol: position.symbol.symbol || position.symbol,
              price_per_share: price,
              purchase_price: bookValue / quantity,
              quantity: quantity,
              currency: position.currency || "USD",
              asset_type: "stock",
              source: "snaptrade",
              account_id: account.id,
              account_name: account.name || "Investment Account",
              broker_name: account.brokerage?.name || "SnapTrade",
            },
          });

          if (insertError) {
            console.error(
              `Error inserting asset ${position.symbol}:`,
              insertError,
            );
          }
        }
      }

      // Get balances for the account
      const balancesResponse =
        await snaptrade.accountInformation.getUserAccountBalance({
          userId: userId,
          userSecret: userSecret,
          accountId: account.id,
        });

      if (balancesResponse.data) {
        // Process cash balances
        for (const balance of balancesResponse.data) {
          if (balance.cash && parseFloat(balance.amount) > 0) {
            // Insert the cash as an asset
            const { error: insertError } = await supabase
              .from("assets")
              .insert({
                name: `Cash (${balance.currency})`,
                value: parseFloat(balance.amount),
                description: `Cash balance in ${account.name}`,
                location: account.name || "SnapTrade",
                acquisition_date: new Date().toISOString(),
                acquisition_value: parseFloat(balance.amount),
                category_id: categoryData.id,
                is_liability: false,
                user_id: userId,
                metadata: {
                  symbol: "CASH",
                  price_per_share: parseFloat(balance.amount),
                  purchase_price: parseFloat(balance.amount),
                  quantity: 1,
                  currency: balance.currency || "USD",
                  asset_type: "cash",
                  source: "snaptrade",
                  account_id: account.id,
                  account_name: account.name || "Investment Account",
                  broker_name: account.brokerage?.name || "SnapTrade",
                },
              });

            if (insertError) {
              console.error(`Error inserting cash asset:`, insertError);
            }
          }
        }
      }
    }

    return accountsResponse.data;
  } catch (error) {
    console.error("Error handling SnapTrade callback:", error);
    throw error;
  }
}
