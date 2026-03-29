from flask_restful import Api
from .resources import (
    OrganizationList, ComponentList, WorkflowResource,
    ApplicationResource, ApplicationDetailResource, ApplicationAdvanceResource
)

def register_api(app):
    api = Api(app)
    api.add_resource(OrganizationList, '/api/organizations')
    api.add_resource(ComponentList, '/api/components')
    api.add_resource(WorkflowResource, '/api/workflows')
    api.add_resource(ApplicationResource, '/api/applications')
    api.add_resource(ApplicationDetailResource, '/api/applications/<int:app_id>')
    api.add_resource(ApplicationAdvanceResource, '/api/applications/<int:app_id>/advance')
