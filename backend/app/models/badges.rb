# Auto-awarded profile chips. Event-driven (post / reply / helpful mark
# callbacks call Badges.refresh!) rather than a cron job, so awards land the
# moment they're earned. Badges are never revoked.
module Badges
  CATALOG = {
    "first_post" => {
      name: "First post",
      description: "Shared a problem for the first time"
    },
    "first_reply" => {
      name: "First reply",
      description: "Wrote a reply to someone's problem"
    },
    "honest_neighbor" => {
      name: "Honest neighbor",
      description: "Earned 3 helpful points from people you helped"
    },
    "trusted_voice" => {
      name: "Trusted voice",
      description: "Earned 10 helpful points from people you helped"
    },
    "conversation_starter" => {
      name: "Conversation starter",
      description: "A post of yours drew 5 or more replies"
    },
    "crowd_favorite" => {
      name: "Crowd favorite",
      description: "A single reply of yours was marked helpful 10 times"
    }
  }.freeze

  module_function

  def refresh!(user)
    return if user.nil?

    stat = UserStat.for_user(user)
    earned = CATALOG.keys.select { |key| earned?(key, user, stat) }
    new_badges = (stat.badges | earned)
    stat.update!(badges: new_badges) if new_badges != stat.badges
  end

  def earned?(key, user, stat)
    case key
    when "first_post" then user.posts.exists?
    when "first_reply" then user.comments.exists?
    when "honest_neighbor" then stat.helpful_points >= 3
    when "trusted_voice" then stat.helpful_points >= 10
    when "conversation_starter"
      Comment.where(post_id: user.posts.select(:id)).group(:post_id).having("COUNT(*) >= 5").exists?
    when "crowd_favorite"
      HelpfulMark.where(markable_type: "Comment", markable_id: user.comments.select(:id))
        .group(:markable_id).having("COUNT(*) >= 10").exists?
    else
      false
    end
  end

  # Catalog entries for a user's earned keys, for the profile JSON.
  def for_keys(keys)
    Array(keys).filter_map do |key|
      entry = CATALOG[key]
      entry && {key: key, name: entry[:name], description: entry[:description]}
    end
  end
end
