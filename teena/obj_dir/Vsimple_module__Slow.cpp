// Verilated -*- C++ -*-
// DESCRIPTION: Verilator output: Design implementation internals
// See Vsimple_module.h for the primary calling header

#include "Vsimple_module.h"
#include "Vsimple_module__Syms.h"

//==========

VL_CTOR_IMP(Vsimple_module) {
    Vsimple_module__Syms* __restrict vlSymsp = __VlSymsp = new Vsimple_module__Syms(this, name());
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    // Reset internal values
    
    // Reset structure values
    _ctor_var_reset();
}

void Vsimple_module::__Vconfigure(Vsimple_module__Syms* vlSymsp, bool first) {
    if (false && first) {}  // Prevent unused
    this->__VlSymsp = vlSymsp;
    if (false && this->__VlSymsp) {}  // Prevent unused
    Verilated::timeunit(-12);
    Verilated::timeprecision(-12);
}

Vsimple_module::~Vsimple_module() {
    VL_DO_CLEAR(delete __VlSymsp, __VlSymsp = NULL);
}

void Vsimple_module::_eval_initial(Vsimple_module__Syms* __restrict vlSymsp) {
    VL_DEBUG_IF(VL_DBG_MSGF("+    Vsimple_module::_eval_initial\n"); );
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    // Body
    vlTOPp->__Vclklast__TOP__clk = vlTOPp->clk;
    vlTOPp->__Vclklast__TOP__reset = vlTOPp->reset;
}

void Vsimple_module::final() {
    VL_DEBUG_IF(VL_DBG_MSGF("+    Vsimple_module::final\n"); );
    // Variables
    Vsimple_module__Syms* __restrict vlSymsp = this->__VlSymsp;
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
}

void Vsimple_module::_eval_settle(Vsimple_module__Syms* __restrict vlSymsp) {
    VL_DEBUG_IF(VL_DBG_MSGF("+    Vsimple_module::_eval_settle\n"); );
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
}

void Vsimple_module::_ctor_var_reset() {
    VL_DEBUG_IF(VL_DBG_MSGF("+    Vsimple_module::_ctor_var_reset\n"); );
    // Body
    clk = VL_RAND_RESET_I(1);
    reset = VL_RAND_RESET_I(1);
    a = VL_RAND_RESET_I(8);
    b = VL_RAND_RESET_I(8);
    sum = VL_RAND_RESET_I(8);
    { int __Vi0=0; for (; __Vi0<1; ++__Vi0) {
            __Vm_traceActivity[__Vi0] = VL_RAND_RESET_I(1);
    }}
}
