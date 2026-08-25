from hrms.hr.doctype.leave_application.leave_application import LeaveApplication


class CustomLeaveApplication(LeaveApplication):
    def validate_back_dated_application(self):
        # TEMPORARY OVERRIDE FOR HISTORICAL DATA MIGRATION
        # Remove after leave application import is completed
        return