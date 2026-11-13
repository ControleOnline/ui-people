import {resolveCurrentCompanySelection} from '@controleonline/ui-people/src/react/utils/currentCompanySelection';
it('does not restore an unavailable company, or select one when every company is unavailable',()=>{
 const disabled={id:3,panel_enabled:false}, enabled={id:4,panel_enabled:true};
 expect(resolveCurrentCompanySelection({companies:[disabled,enabled],session:{mycompany:3}})?.id).toBe(4);
 expect(resolveCurrentCompanySelection({companies:[disabled],session:{mycompany:3}})).toBeNull();
});
it('does not select a company with disabled user access',()=>{
 expect(resolveCurrentCompanySelection({companies:[{id:3,user:{enabled:false}},{id:4}],session:{mycompany:3}})?.id).toBe(4);
});
