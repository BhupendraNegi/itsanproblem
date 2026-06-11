require "rails_helper"

RSpec.describe DigestJob, type: :job do
  let!(:op) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:commenter) { User.create!(name: "Bob", email: "bob@example.com", password: "password123") }
  let!(:post_record) { op.posts.create!(title: "My problem", body: "It is bad.") }

  before { ActionMailer::Base.deliveries.clear }

  def create_reply_notification
    post_record.comments.create!(body: "Here to help", user: commenter)
  end

  it "emails users with pending notifications and marks them digested" do
    create_reply_notification

    expect { described_class.perform_now }
      .to change { ActionMailer::Base.deliveries.size }.by(1)

    mail = ActionMailer::Base.deliveries.last
    expect(mail.to).to eq(["alice@example.com"])
    expect(mail.subject).to include("1 new reply")
    expect(mail.text_part.body.to_s).to include("My problem")
    expect(op.notifications.pending_digest).to be_empty
  end

  it "does not email the same notification twice" do
    create_reply_notification
    described_class.perform_now

    expect { described_class.perform_now }
      .not_to change { ActionMailer::Base.deliveries.size }
  end

  it "skips notifications already read in-app" do
    create_reply_notification
    op.notifications.update_all(read_at: Time.current)

    expect { described_class.perform_now }
      .not_to change { ActionMailer::Base.deliveries.size }
  end

  it "respects the opt-out" do
    op.update!(email_digest_enabled: false)
    create_reply_notification

    expect { described_class.perform_now }
      .not_to change { ActionMailer::Base.deliveries.size }
  end

  it "summarizes helpful marks too" do
    comment = post_record.comments.create!(body: "Advice", user: commenter)
    comment.helpful_marks.create!(user: op)

    described_class.perform_now
    mail = ActionMailer::Base.deliveries.last
    expect(mail.to).to eq(["bob@example.com"])
    expect(mail.subject).to include("1 helpful mark")
  end
end
