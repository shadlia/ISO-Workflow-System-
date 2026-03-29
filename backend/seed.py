from app import create_app
from app.extensions import db
from app.models import Organization, Component, Workflow, WorkflowStep, Application

def seed_data():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Create Organizations
        org_a = Organization(name="Org A - Fast Track CB")
        org_b = Organization(name="Org B - Strict Compliance CB")
        db.session.add_all([org_a, org_b])
        db.session.commit()

        # Create Baseline Components
        c1 = Component(name="Application Review", description="Initial review of the applied documents.")
        c2 = Component(name="Pre-Audit", description="Preliminary audit to identify gaps.")
        c3 = Component(name="Audit", description="Full-scale on-site or remote audit.")
        c4 = Component(name="Technical Review", description="Deep dive into technical requirements.")
        c5 = Component(name="Certification Decision", description="Final decision to grant certification.")
        c6 = Component(name="Document Upload", description="Request for additional documentation.")
        db.session.add_all([c1, c2, c3, c4, c5, c6])
        db.session.commit()

        # Create Workflow for Org A (Review -> Audit -> Decision)
        wf_a = Workflow(org_id=org_a.id, name="Standard 3-Step Flow")
        db.session.add(wf_a)
        db.session.commit()

        steps_a = [
            WorkflowStep(workflow_id=wf_a.id, component_id=c1.id, step_order=0, custom_name="Initial Application Review"),
            WorkflowStep(workflow_id=wf_a.id, component_id=c3.id, step_order=1, custom_name="Main Audit"),
            WorkflowStep(workflow_id=wf_a.id, component_id=c5.id, step_order=2, custom_name="Final Decision")
        ]
        db.session.add_all(steps_a)
        
        # Create Workflow for Org B (Review -> Pre-Audit -> Audit -> Tech Review -> Decision)
        wf_b = Workflow(org_id=org_b.id, name="Strict 5-Step Flow")
        db.session.add(wf_b)
        db.session.commit()

        steps_b = [
            WorkflowStep(workflow_id=wf_b.id, component_id=c1.id, step_order=0, custom_name="Application Check"),
            WorkflowStep(workflow_id=wf_b.id, component_id=c2.id, step_order=1, custom_name="Pre-Audit Phase"),
            WorkflowStep(workflow_id=wf_b.id, component_id=c3.id, step_order=2, custom_name="Full Audit Phase"),
            WorkflowStep(workflow_id=wf_b.id, component_id=c4.id, step_order=3, custom_name="Technical Deep-Dive"),
            WorkflowStep(workflow_id=wf_b.id, component_id=c5.id, step_order=4, custom_name="Board Decision")
        ]
        db.session.add_all(steps_b)
        
        db.session.commit()
        
        print("Database seeded successfully with default organizations, components, and workflows!")

if __name__ == '__main__':
    seed_data()
