from flask import request, jsonify
from flask_restful import Resource
from app.extensions import db
from app.models import Organization, Component, Workflow, WorkflowStep, Application

# ----------------- Organizations & Components -----------------
class OrganizationList(Resource):
    def get(self):
        orgs = Organization.query.all()
        return jsonify([{'id': o.id, 'name': o.name} for o in orgs])

class ComponentList(Resource):
    def get(self):
        components = Component.query.all()
        return jsonify([{'id': c.id, 'name': c.name, 'description': c.description} for c in components])

# ----------------- Workflows -----------------
class WorkflowResource(Resource):
    def get(self):
        org_id = request.args.get('org_id')
        if not org_id:
            return {'error': 'org_id parameter is required'}, 400
            
        workflows = Workflow.query.filter_by(org_id=org_id).all()
        result = []
        for w in workflows:
            steps = [{'id': s.id, 'component_id': s.component_id, 'step_order': s.step_order, 
                      'custom_name': s.custom_name, 'component_name': s.component.name} 
                     for s in w.steps]
            result.append({'id': w.id, 'name': w.name, 'steps': steps})
            
        return jsonify(result)

    def post(self):
        data = request.json
        if not data or 'org_id' not in data or 'name' not in data or 'steps' not in data:
            return {'error': 'org_id, name, and steps (array) are required'}, 400
            
        new_workflow = Workflow(org_id=data['org_id'], name=data['name'])
        db.session.add(new_workflow)
        db.session.commit()
        
        for step_data in data['steps']:
            new_step = WorkflowStep(
                workflow_id=new_workflow.id,
                component_id=step_data['component_id'],
                step_order=step_data['step_order'],
                custom_name=step_data.get('custom_name', '')
            )
            db.session.add(new_step)
            
        db.session.commit()
        return {'message': 'Workflow created successfully', 'workflow_id': new_workflow.id}, 201

# ----------------- Applications -----------------
class ApplicationResource(Resource):
    def get(self):
        org_id = request.args.get('org_id')
        if not org_id:
            return {'error': 'org_id parameter is required'}, 400
            
        apps = Application.query.filter_by(org_id=org_id).all()
        return jsonify([{'id': a.id, 'workflow_id': a.workflow_id, 'workflow_name': a.workflow.name, 
                         'current_step_order': a.current_step_order, 'status': a.status} for a in apps])

    def post(self):
        data = request.json
        if not data or 'org_id' not in data or 'workflow_id' not in data:
            return {'error': 'org_id and workflow_id are required'}, 400
            
        wf = Workflow.query.filter_by(id=data['workflow_id'], org_id=data['org_id']).first()
        if not wf:
            return {'error': 'Invalid workflow_id for this org_id'}, 404
            
        new_app = Application(org_id=data['org_id'], workflow_id=data['workflow_id'])
        db.session.add(new_app)
        db.session.commit()
        return {'message': 'Application started', 'application_id': new_app.id}, 201

class ApplicationDetailResource(Resource):
    def get(self, app_id):
        app_record = Application.query.get_or_404(app_id)
        steps = WorkflowStep.query.filter_by(workflow_id=app_record.workflow_id).order_by(WorkflowStep.step_order).all()
        
        current_step_detail = None
        for step in steps:
            if step.step_order == app_record.current_step_order:
                current_step_detail = {
                    'step_order': step.step_order,
                    'custom_name': step.custom_name,
                    'component_name': step.component.name
                }
                break
                
        return jsonify({
            'id': app_record.id,
            'org_id': app_record.org_id,
            'workflow_id': app_record.workflow_id,
            'workflow_name': app_record.workflow.name,
            'status': app_record.status,
            'current_step_order': app_record.current_step_order,
            'total_steps': len(steps),
            'current_step_detail': current_step_detail,
            'all_steps': [{'step_order': s.step_order, 'name': s.custom_name or s.component.name} for s in steps]
        })

class ApplicationAdvanceResource(Resource):
    def post(self, app_id):
        app_record = Application.query.get_or_404(app_id)
        if app_record.status == 'completed':
            return {'message': 'Application is already completed'}, 400
            
        total_steps = WorkflowStep.query.filter_by(workflow_id=app_record.workflow_id).count()
        app_record.current_step_order += 1
        
        if app_record.current_step_order >= total_steps:
            app_record.current_step_order = total_steps
            app_record.status = 'completed'
            message = 'Application completed successfully!'
        else:
            message = 'Application advanced to next step'
            
        db.session.commit()
        return {'message': message, 'new_step_order': app_record.current_step_order, 'status': app_record.status}, 200
