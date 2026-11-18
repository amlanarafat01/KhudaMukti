import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ClaimMailData, donorTemplate, receiverTemplate } from './mail.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: MailerService) {}

  /**
   * Sends the "claim confirmed" emails to receiver and donor.
   * Never throws: a mail problem must not undo or fail a committed claim.
   */
  async sendClaimConfirmed(data: ClaimMailData, receiverEmail?: string | null, donorEmail?: string | null) {
    const jobs: Promise<unknown>[] = [];
    if (receiverEmail) {
      jobs.push(
        this.mailer.sendMail({
          to: receiverEmail,
          subject: `Claim #${data.claimId} confirmed`,
          html: receiverTemplate(data),
        }),
      );
    }
    if (donorEmail) {
      jobs.push(
        this.mailer.sendMail({
          to: donorEmail,
          subject: `Your listing "${data.listingTitle}" was claimed`,
          html: donorTemplate(data),
        }),
      );
    }
    const results = await Promise.allSettled(jobs);
    results.forEach((r) => {
      if (r.status === 'rejected') this.logger.warn(`Email failed for claim #${data.claimId}: ${r.reason?.message ?? r.reason}`);
    });
  }
}
