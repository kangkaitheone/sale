import ajax from '../../lib/ajax';
import util from '../../lib/util'
import {Store,Module,ActionContext} from 'vuex' 
interface SessionState{
    application:any,
    user:any,
    tenant: any,
    roles:any
}
class SessionStore implements Module<SessionState,any>{
    namespaced=true;
    state={
        application:null,
        user:null,
        tenant: null,
        roles:null
    }
    actions={
        async init(content:ActionContext<SessionState,any>){
            var token = util.abp.auth.getToken();
            if (!token) {
                util.abp.auth.clearToken();
                return;
            }
            let rep=await ajax.get('/api/user/current');
            content.state.user=rep.data.user;
            content.state.roles = rep.data.role;
            util.abp.auth.init(rep.data.allPermissions,rep.data.permissions)
       
        }
    }
}
const session=new SessionStore();
export default session;