class Flag < ApplicationRecord
  REASONS = %w[harm spam identifying_info].freeze
  AUTO_HIDE_THRESHOLD = 3

  belongs_to :user
  belongs_to :flaggable, polymorphic: true

  validates :reason, inclusion: {in: REASONS}
  validates :user_id, uniqueness: {scope: [:flaggable_type, :flaggable_id]}

  after_create :auto_hide_flaggable

  private

  # The kill switch: enough distinct flags hides the content pending review.
  def auto_hide_flaggable
    return if flaggable.hidden_at.present?
    return if flaggable.flags.count < AUTO_HIDE_THRESHOLD

    flaggable.update!(hidden_at: Time.current)
  end
end
