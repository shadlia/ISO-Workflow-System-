from app.extensions import db

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    workflows = db.relationship('Workflow', backref='organization', lazy=True)
    applications = db.relationship('Application', backref='organization', lazy=True)

class Component(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    steps = db.relationship('WorkflowStep', backref='component', lazy=True)

class Workflow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    version = db.Column(db.Integer, default=1)
    steps = db.relationship('WorkflowStep', backref='workflow', lazy=True, cascade="all, delete-orphan", order_by='WorkflowStep.step_order')
    applications = db.relationship('Application', backref='workflow', lazy=True)

class WorkflowStep(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.Integer, db.ForeignKey('workflow.id'), nullable=False)
    component_id = db.Column(db.Integer, db.ForeignKey('component.id'), nullable=False)
    step_order = db.Column(db.Integer, nullable=False)
    custom_name = db.Column(db.String(100))

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    workflow_id = db.Column(db.Integer, db.ForeignKey('workflow.id'), nullable=False)
    current_step_order = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='in_progress') # in_progress, completed
